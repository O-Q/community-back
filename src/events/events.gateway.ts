import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class EventsGateway {
  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: any): string {
    return 'Hello, world!';
  }
}
