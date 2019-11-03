export enum ServerEvent {
    JOIN_CHAT = 'joinChat',
    SEND_MESSAGE_CHAT = 'sendMessageChat',
}

export enum ClientEvent {
    CHAT = 'chat',
    ONLINE_CHAT = 'onlineChat',
    LATEST_MESSAGE = 'latestMessage',
    EXCEPTION = 'exception',
}
