class WebSocketService {
    private socket: WebSocket | null = null;
    private messageHandlers: ((message: string) => void)[] = [];

    connect(url: string) {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log("🔵 WebSocket connected");
        };

        this.socket.onmessage = (event) => {
            this.messageHandlers.forEach(handler => handler(event.data));
        };

        this.socket.onclose = () => {
            console.log("🔴 WebSocket disconnected");
        };

        this.socket.onerror = (error) => {
            console.error("⚠ WebSocket error:", error);
        };
    }

    sendMessage(message: string) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        } else {
            console.error("WebSocket is not connected!");
        }
    }

    onMessage(handler: (message: string) => void) {
        this.messageHandlers.push(handler);
    }
}

export default new WebSocketService();
