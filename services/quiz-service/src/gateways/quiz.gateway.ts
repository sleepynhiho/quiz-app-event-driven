import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class QuizGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Method to broadcast quiz events to all connected clients
  broadcastQuizEvent(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Method to broadcast to specific quiz room
  broadcastToQuiz(quizId: string, event: string, data: any) {
    this.server.to(`quiz-${quizId}`).emit(event, data);
  }

  // Method for clients to join quiz room
  joinQuizRoom(client: Socket, quizId: string) {
    client.join(`quiz-${quizId}`);
    console.log(`Client ${client.id} joined quiz room: quiz-${quizId}`);
  }

  // Method for clients to leave quiz room
  leaveQuizRoom(client: Socket, quizId: string) {
    client.leave(`quiz-${quizId}`);
    console.log(`Client ${client.id} left quiz room: quiz-${quizId}`);
  }

  // WebSocket message handlers
  @SubscribeMessage('join-quiz')
  handleJoinQuiz(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { quizId: string; playerId: string },
  ) {
    this.joinQuizRoom(client, data.quizId);
    client.emit('joined-quiz', { quizId: data.quizId, success: true });
  }

  @SubscribeMessage('leave-quiz')
  handleLeaveQuiz(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { quizId: string },
  ) {
    this.leaveQuizRoom(client, data.quizId);
    client.emit('left-quiz', { quizId: data.quizId, success: true });
  }
}
