export class ChatRoom {
    usersCount: number;
    latestMessages: ChatRoomMessage[];
}
export interface ChatRoomMessage {
    username: string;
    message: string;
}


export const chatRooms = new Map<string, ChatRoom>();