import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  WsException,
  BaseWsExceptionFilter,
} from '@nestjs/websockets';
import { UseGuards, UseFilters, ValidationPipe, BadRequestException, Get } from '@nestjs/common';
import { JoinChatDto } from './dto/join-chat.dto';
import { MessageChatDto } from './dto/message.dto';
import { ServerEvent, ClientEvent } from '../shared/socket-events.enum';
import { ChatRoom, ChatRoomMessage } from '../shared/chatroom.interface';
import { Server, Socket } from 'socket.io';
import { LATEST_MESSAGE_COUNT } from './constant/latest-message.constant';
import { WsAuthGuard } from '../auth/guards/ws-auth-guard.guard';
import { JwtService } from '@nestjs/jwt';
import { GetUser } from '../user/decorators/get-user.decorator';
import { User } from '../user/interfaces/user.interface';
import { WsExceptionsFilter } from './filter/ws-exception.filter';

@UseGuards(WsAuthGuard)
@UseFilters(WsExceptionsFilter)
@WebSocketGateway(8080)
export class EventsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  chatRooms = new Map<string, ChatRoom>();
  constructor(private jwt: JwtService) { }
  handleConnection(client: Socket) {
    this._handleDisconnecting(client);
    this._validateToken(client);
  }
  private _handleDisconnecting(client: Socket) {
    client.on('disconnecting', () => {
      const sid = Object.keys(client.rooms)[0];
      const chatRoom = this.chatRooms.get(sid);
      if (chatRoom) {
        chatRoom.usersCount -= 1;
        client.broadcast.to(sid).emit(ClientEvent.ONLINE_CHAT, chatRoom.usersCount);
      }
    });
  }

  /**
   * Check whether user is in social
   * Leave last room ->
   * Join the room ->
   * Add user to `ChatRoom.users` ->
   * broadcast new user array on the room ->
   * emit latest message to the client
   * @param joinChatDto
   * @param client
   */
  @SubscribeMessage(ServerEvent.JOIN_CHAT)
  async joinChat(@MessageBody(ValidationPipe) joinChatDto: JoinChatDto, @ConnectedSocket() client: Socket, @GetUser() user) {
    const { sid } = joinChatDto;
    if (this._isUserRegistered(sid, user)) {
      client.leaveAll();
      const chatRoom = this._getChatRoom(sid);
      chatRoom.usersCount += 1;
      client.join(sid).to(sid).broadcast.emit(ClientEvent.ONLINE_CHAT, chatRoom.usersCount);
      client.emit(ClientEvent.ONLINE_CHAT, chatRoom.usersCount); // even for user
      client.emit(ClientEvent.LATEST_MESSAGE, chatRoom.latestMessages);
    } else {
      client.disconnect();
    }
  }

  /**
   * Add message to `ChatRoom.latestMessages` and delete out of range messages ->
   * broadcast the message on the room
   * @param messageDto
   * @param client
   */
  @SubscribeMessage(ServerEvent.SEND_MESSAGE_CHAT)
  sendMessageChat(
    @MessageBody() messageDto: MessageChatDto,
    @ConnectedSocket() client: Socket,
    @GetUser() user: User,
  ) {
    const { message, sid } = messageDto;
    const { username } = user;
    const chatRoom = this._getChatRoom(sid);
    const latestMessages = chatRoom.latestMessages;
    latestMessages.push({ username, message }); // save message with username
    latestMessages.splice(0, latestMessages.length - LATEST_MESSAGE_COUNT); // delete out of range messages from array 
    client.broadcast.to(sid).emit(ClientEvent.CHAT, { username, message } as ChatRoomMessage); // broadcast the message to the room
  }

  /**
   * Get chat room by room id (sid) in Map
   * @param sid social id (room id)
   */
  private _getChatRoom(sid: string) {
    const chatRoom = this.chatRooms.get(sid);
    if (chatRoom) {
      return chatRoom;
    } else {
      this.chatRooms.set(sid, { usersCount: 0, latestMessages: [] });
      return this.chatRooms.get(sid);
    }
  }

  /**
   * Get username by socket.io id
   * @param chatRoom The chat room that user in it
   * @param clientId client's socket.io id
   */
  // private _getUsername(chatRoom: ChatRoom, clientId: string) {
  //   const username = chatRoom.users.find((user) => user.id === clientId)?.username;
  //   if (username) {
  //     return username;
  //   } else {
  //     throw new WsException('not joined in this chat room');
  //   }
  // }

  /**
   * verify token and if not verify(throw exception) disconnect client.
   * @param client who must validate
   */
  private _validateToken(client: Socket) {
    try {
      const token = client.handshake.query.token;
      this.jwt.verify(token);
    } catch {
      client.disconnect();
    }
  }

  private _isUserRegistered(sid: string, user: User) {
    if (user.socials?.some(s => s.social.toHexString() === sid)) {
      return true;
    } else {
      throw new WsException('user is not registered in this social');
    }

  }
}
