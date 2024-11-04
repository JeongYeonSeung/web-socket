// chat.interface.ts
export interface ChatMessage {
  roomId: string;
  userId: string;
  message: string;
  timestamp: Date;
}

export interface JoinRoomPayload {
  roomId: string;
  userId: string;
}
