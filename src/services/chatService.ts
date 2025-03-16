const WS_URL ="wss://localhost:7047/api/chat/connect" // כאן תוכל לשים גם process.env במידת הצורך

class ChatService {
  private socket: WebSocket | null = null;
  private listeners: ((msg: string) => void)[] = [];

  connect() {
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = () => {
      console.log("WebSocket connected!");
    };

    this.socket.onmessage = (event) => {
      this.listeners.forEach((listener) => listener(event.data));
    };

    this.socket.onclose = () => {
      console.log("WebSocket disconnected!");
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  sendMessage(message: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error("WebSocket not open yet.");
    }
  }

  onMessage(listener: (msg: string) => void) {
    this.listeners.push(listener);
  }
}

export default new ChatService();
