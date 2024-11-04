import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessage, JoinRoomPayload } from './dto/chat.interface';

@WebSocketGateway(3030, {
  namespace: 'chat',
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatGateway');

  // 사용자 관리를 위한 Map
  // TODO: DB 연동
  private users: Map<string, { userId: string; roomId: string }> = new Map();

  // 채팅방 참여하기
  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    const { roomId, userId } = payload;

    console.log(userId);

    // 이전 방에서 나가기
    const prevRoom = this.users.get(client.id)?.roomId;
    if (prevRoom) {
      client.leave(prevRoom);
    }

    // 새로운 방 참여
    client.join(roomId);
    this.users.set(client.id, { userId, roomId });

    // 입장 메시지 브로드캐스트
    this.server.to(roomId).emit('user_joined', {
      userId,
      message: `${userId}님이 입장하셨습니다.`,
      timestamp: new Date(),
    });

    this.logger.log(`${userId} join room. roomId : ${roomId}`);

    return { status: 'ok', message: `방 ${roomId}에 참여했습니다.` };
  }

  // 메시지 전송하기
  @SubscribeMessage('send_message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() chatMessage: ChatMessage,
  ) {
    const user = this.users.get(client.id);
    if (!user) return;

    this.logger.log(`${user.userId} send message. roomId : ${user.roomId}`);

    const messageWithTimestamp = {
      ...chatMessage,
      timestamp: new Date(),
    };

    // 해당 방의 모든 사용자에게 메시지 브로드캐스트
    this.server
      .to(chatMessage.roomId)
      .emit('new_message', messageWithTimestamp);

    return { status: 'ok' };
  }

  // 채팅방 나가기
  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const user = this.users.get(client.id);
    if (!user) return;

    const { userId, roomId } = user;
    client.leave(roomId);
    this.users.delete(client.id);

    // 퇴장 메시지 브로드캐스트
    this.server.to(roomId).emit('user_left', {
      userId,
      message: `${userId}님이 퇴장하셨습니다.`,
      timestamp: new Date(),
    });

    return { status: 'ok', message: `Left room ${roomId}` };
  }

  afterInit() {
    this.logger.log('웹소켓 서버 초기화 ✅');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client Connected : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.users.get(client.id);
    if (user) {
      const { userId, roomId } = user;
      this.server.to(roomId).emit('user_left', {
        userId,
        message: `${userId}님이 연결을 종료했습니다.`,
        timestamp: new Date(),
      });
      this.users.delete(client.id);
    }
    this.logger.log(`Client Disconnected : ${client.id}`);
  }
}
