import React, { useState, useEffect, useRef } from 'react';
import ChatService from '../services/chatServices';

const ChatComponent: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const chatServiceRef = useRef<ChatService | null>(null); // משתנה לשמירת החיבור ל-WebSocket

  useEffect(() => {
    const handleNewMessage = (message: string) => {
      setMessages(prevMessages => [...prevMessages, message]);
    };

    // יצירת חיבור ושמירתו בתוך useRef
    chatServiceRef.current = new ChatService('ws://localhost:7047/api/Chat/connect', handleNewMessage);
    chatServiceRef.current.connect();
 
    return () => {
      chatServiceRef.current?.disconnect();
    };
  }, []);

  const handleSendMessage = () => {
    if (chatServiceRef.current) {
      chatServiceRef.current.sendMessage(message);
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Chat</h2>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
