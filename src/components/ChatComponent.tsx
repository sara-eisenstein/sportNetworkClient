import React, { useEffect, useState } from "react";
import WebSocketService from "../services/websocketService";

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<string[]>([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        WebSocketService.connect("wss://localhost:7074/ws/chat");

        WebSocketService.onMessage((msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        return () => {
            console.log("🔌 מחברים את WebSocket...");
        };
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            WebSocketService.sendMessage(message);
            setMessage("");
        }
    };

    return (
        <div className="chat-container">
            <div className="messages">
                {messages.map((msg, index) => (
                    <p key={index} className="message">{msg}</p>
                ))}
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="כתוב הודעה..."
                />
                <button onClick={sendMessage}>שלח</button>
            </div>
        </div>
    );
};

export default Chat;
