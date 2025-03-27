import axios from "axios";

const WS_URL = "wss://localhost:7047/api/chat/connect";
const HTTPS_URL = process.env.REACT_APP_API_URL;

class ChatService {
  private socket: WebSocket | null = null;
  private listeners: ((msg: any) => void)[] = [];
  private isConnected: boolean = false;

  connect(userId: number, retries = 3, delay = 2000): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!userId) return reject(new Error("User ID is not defined"));
      if (this.socket && this.isConnected) return resolve();

      const tryConnect = (attempt: number) => {
        console.log(`Trying to connect... (attempt ${attempt})`);
        this.socket = new WebSocket(`${WS_URL}?userId=${userId}`);

        this.socket.onopen = () => {
          this.isConnected = true;
          console.log("WebSocket connected!");
          resolve();
        };

        this.socket.onerror = (err) => {
          console.error(`WebSocket error on attempt ${attempt}:`, err);
          this.isConnected = false;
          if (attempt < retries) {
            setTimeout(() => tryConnect(attempt + 1), delay);
          } else {
            reject(new Error("Failed to connect after retries"));
          }
        };

        this.socket.onclose = (event) => {
          console.log("WebSocket disconnected!", event.reason);
          this.isConnected = false;
        };

        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('received message', data);
          this.listeners.forEach((listener) => listener(data));
        };
      };

      tryConnect(1);
    });
  }

  sendMessage(payload: { 
    SenderId: number; 
    RecipientId: number; 
    MessageContent: string; 
    userName: string;
    firstName?: string;
    lastName?: string;
  }): void {
    if (this.socket && this.isConnected) {
      const stringMessage = JSON.stringify(payload);
      console.log('sending message', { payload, stringMessage });
      this.socket.send(stringMessage);
    } else {
      console.error("WebSocket not connected. Can't send message.");
    }
  }

  onMessage(listener: (msg: any) => void): void {
    this.listeners.push(listener);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
      console.log("WebSocket disconnected.");
    }
  }

  isSocketConnected(): boolean {
    return this.isConnected;
  }
  
  fetchOldMessages(userId: number, recipientId: number, page: number): Promise<any[]> {
    return axios.get(`${HTTPS_URL}/api/ChatMessage/GetChatMessages`, {
      params: {
        userId: userId,
        otherUserId: recipientId,
        pageNumber: page
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
    .then(res => res.data)
    .catch(err => {
      console.error("Failed to fetch old messages:", err);
      return [];
    });
  }
}

export default new ChatService();