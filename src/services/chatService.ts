const WS_URL ="wss://localhost:7047/api/chat/connect?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYSBhIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI0IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiYUBhLmEiLCJleHAiOjE3NDI0OTU2MzQsImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0OjcwNDcvIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzA0Ny8ifQ.aZ4jVYRFOZmgPCR0WULtKkVmbvO9-gevngxRa2YmQ90" // כאן תוכל לשים גם process.env במידת הצורך
wss://localhost:7047/api/chat/connect?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiYSBhIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiI0IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvZW1haWxhZGRyZXNzIjoiYUBhLmEiLCJleHAiOjE3NDI0OTU2MzQsImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0OjcwNDcvIiwiYXVkIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzA0Ny8ifQ.aZ4jVYRFOZmgPCR0WULtKkVmbvO9-gevngxRa2YmQ90`
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
