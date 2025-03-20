import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { chatService } from "../../services/chatServices";
import "../../styles/chat.css";

interface Props {
  userName: string;
}

const ChatBox: React.FC<Props> = ({ userName }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      console.error("אין טוקן, לא ניתן להתחבר ל-WebSocket");
      return;
    }

    chatService.connect(token);

    chatService.onOpen(() => {
      console.log("WebSocket התחבר בהצלחה");
    });

    chatService.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    chatService.onError((err) => {
      console.error("WebSocket error: ", err);
    });

    chatService.onClose(() => {
      console.log("WebSocket נסגר");
    });

    return () => {
      chatService.disconnect();
    };
  }, [token]);

  const handleSend = () => {
    if (!message.trim()) return;
    const formattedMsg = `${userName}: ${message}`;
    chatService.sendMessage(formattedMsg);
    setMessages((prev) => [...prev, formattedMsg]);
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
