class ChatService {
    private socket: WebSocket | null = null;
    private messageCallback: (message: string) => void;
  
    constructor(private url: string, messageCallback: (message: string) => void) {
      this.messageCallback = messageCallback;
    }
  
    connect() {
      this.socket = new WebSocket(this.url);
  
      this.socket.onopen = () => {
        console.log('Connected to the WebSocket server');
      };
  
      this.socket.onmessage = (event) => {
        const message = event.data;
        console.log('Message received: ', message);
        this.messageCallback(message); // Call the callback function with the message
      };
  
      this.socket.onerror = (error) => {
        console.error('WebSocket Error: ', error);
      };
  
      this.socket.onclose = (event) => {
        console.log('WebSocket closed: ', event);
      };
    }
  
    sendMessage(message: string) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(message);
      }
    }
  
    disconnect() {
      if (this.socket) {
        this.socket.close();
      }
    }
  }
  
  export default ChatService;
  