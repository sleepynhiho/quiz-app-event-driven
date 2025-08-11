import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private quizId: string | null = null;
  private callbacks: { [event: string]: ((data: any) => void)[] } = {};

  connect(): void {
    if (this.socket?.connected) return;

    // Use appropriate URL based on environment
    const wsUrl = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:3001';
    
    this.socket = io(wsUrl, {
      transports: ['websocket'],
      timeout: 5000,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Listen to all events and forward to callbacks
    ['quiz.started', 'question.presented', 'time.up', 'quiz.ended', 'player.joined', 'score.updated'].forEach(event => {
      this.socket?.on(event, (data: any) => {
        console.log(`Received ${event}:`, data);
        this.triggerCallbacks(event, data);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      if (this.quizId) {
        this.leaveQuiz(this.quizId);
      }
      this.socket.disconnect();
      this.socket = null;
      this.quizId = null;
      this.callbacks = {};
    }
  }

  joinQuiz(quizId: string, playerId: string): void {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, attempting to connect...');
      this.connect();
      // Wait a bit for connection then try again
      setTimeout(() => this.joinQuiz(quizId, playerId), 1000);
      return;
    }

    this.quizId = quizId;
    this.socket.emit('join-quiz', { quizId, playerId });

    this.socket.on('joined-quiz', (data: any) => {
      console.log('Successfully joined quiz:', data);
    });
  }

  leaveQuiz(quizId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-quiz', { quizId });
      this.quizId = null;
    }
  }

  // Event subscription system
  on(event: string, callback: (data: any) => void): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  private triggerCallbacks(event: string, data: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getCurrentQuizId(): string | null {
    return this.quizId;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;