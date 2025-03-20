class ChatService {
  private socket: WebSocket | null = null;

  connect(token: string) {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = `wss://127.0.0.1:7047/api/chat/connect?token=${token}`;

    this.socket = new WebSocket(url);
  }

  onOpen(callback: () => void) {
    if (!this.socket) return;
    this.socket.onopen = callback;
  }

  onError(callback: (err: Event) => void) {
    if (!this.socket) return;
    this.socket.onerror = callback;
  }

  onClose(callback: () => void) {
    if (!this.socket) return;
    this.socket.onclose = callback;
  }

  onMessage(callback: (msg: string) => void) {
    if (!this.socket) return;
    this.socket.onmessage = (event) => {
      callback(event.data);
    };
  }

  sendMessage(msg: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(msg);
    } else {
      console.error("WebSocket לא פתוח לשליחה");
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const chatService = new ChatService();
