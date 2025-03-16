import React, { useEffect, useState } from "react";
import chatService from "../../services/chatService";
import "../../styles/chat.css";

interface Props {
  userName: string;
}

const ChatBox: React.FC<Props> = ({ userName }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    chatService.connect();
    chatService.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    const formattedMsg = `${userName}: ${message}`;
    chatService.sendMessage(formattedMsg);
    setMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className="chat-message">{msg}</div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="כתוב הודעה..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>שלח</button>
      </div>
    </div>
  );
};

export default ChatBox;
