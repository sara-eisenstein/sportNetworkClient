import React, { useEffect, useState } from "react";
import chatService from "../../services/chatService";

interface ChatBoxProps {
  recipientId: number;
  userId: number;
}

const ChatBox: React.FC<ChatBoxProps> = ({ recipientId, userId }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [myName, setMyName] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // לבדוק אם יש עוד הודעות להביא
  const [isLoadingMore, setIsLoadingMore] = useState(false); // טוען הודעות ישנות
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // חיפוש שם המשתמש מתוך הטוקן
    const token = localStorage.getItem("token");
    const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const userNameFromToken = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Unknown";
    setMyName(userNameFromToken);

    console.log('starting chat', { recipientId, userId });
    // אם יש לנו recipientId ו-userId נתחבר ל-websocket
    if (recipientId && userId) {
      // בדיקה אם כבר יש חיבור פעיל
      if (!chatService.isSocketConnected()) {
        console.log("Trying to connect WebSocket...");
        chatService.connect(userId).then(() => {
          setIsConnected(true);
          console.log("WebSocket connected successfully!");
        }).catch(err => {
          console.error("Connection failed:", err);
          setIsConnected(false);
        });
      } else {
        console.log("WebSocket already connected");
        setIsConnected(true);
      }

      // מאזינים להודעות שמתקבלות
      chatService.onMessage((msg: any) => {
        console.log('WebSocket message received:', msg);
        if (
          (msg.SenderId === recipientId && msg.RecipientId === userId) ||
          (msg.SenderId === userId && msg.RecipientId === recipientId)
        ) {
          console.log('Message matches current chat:', { msg, recipientId, userId });
          setMessages((prev) => {
            // בדיקה פחות מחמירה - רק על תוכן ההודעה
            const isDuplicate = prev.some(
              existingMsg => existingMsg.MessageContent === msg.MessageContent
            );
            
            if (isDuplicate) {
              console.log('Duplicate message found, skipping:', msg.MessageContent);
              return prev;
            }
            
            console.log('Adding new message:', msg.MessageContent);
            return [...prev, msg];
          });
        } else {
          console.log('Message does not match current chat:', { msg, recipientId, userId });
        }
      });
    }

    // ניקוי החיבור כשעוזבים את הצ'אט
    return () => {
      // רק אם אנחנו עוזבים את הדף לגמרי
      if (!document.hidden) {
        chatService.disconnect();
        setIsConnected(false);
      }
    };
  }, [recipientId, userId]);
// טעינת הודעות ישנות 
  useEffect(() => {
    const initialLoad = async () => {
      console.log(userId,recipientId)
      const initialMessages = await chatService.fetchOldMessages(userId, recipientId, 1);
      console.log ("ההודעות האחרונות:",initialMessages)
      setMessages(initialMessages.reverse()); // נהפוך כי בשרת הן יורדות מהחדשה לישנה
      setPage(2);
      if (initialMessages.length < 5) setHasMore(false); // אם יש פחות מ-5, כנראה שאין עוד
    };
    
    if (recipientId && userId) {
      initialLoad();
    }
  }, [recipientId, userId]);

  const handleSend = () => {
    if (!message.trim()) return; // אם ההודעה ריקה, לא נשלח
    if (!chatService.isSocketConnected()) {
      console.error("Can't send: WebSocket not connected yet");
      return;
    }
    
    const payload = { SenderId: userId, RecipientId: recipientId, MessageContent: message, userName: myName };

    // שליחה לשרת (אין עדכון מיידי של ה־state פה)
    chatService.sendMessage(payload);

    // ננקה את תיבת ההודעה
    setMessage("");
  };

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollTop === 0 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  const loadMoreMessages = async () => {
    setIsLoadingMore(true); // מתחילים טעינה
    const oldMessages = await chatService.fetchOldMessages(userId, recipientId, page);
    if (oldMessages.length === 0) {
      setHasMore(false);
      setIsLoadingMore(false); // עצירת טעינה
      return;
    }
    setMessages((prev) => [...oldMessages.reverse(), ...prev]);
    setPage((prev) => prev + 1);

    // שמירה על המיקום של הגלילה
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const previousHeight = container.scrollHeight;
      setTimeout(() => {
        const newHeight = container.scrollHeight;
        container.scrollTop = newHeight - previousHeight;
      }, 0);
    }

    setIsLoadingMore(false); // סיום טעינה
  };

  return (
    <div className="chat-container">
      <div
        className="chat-messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.userName === myName ? "my-message" : "other-message"}`}>
            <strong>{msg.userName}:</strong> {msg.MessageContent||msg.messageContent}
          </div>
        ))}
        {isLoadingMore && (
          <div className="loading-spinner">
            <div className="weight-spinner">
              <div className="weight-bar"></div>
            </div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder={isConnected ? "כתוב הודעה..." : "ממתין לחיבור..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={!isConnected}
        />
        <button onClick={handleSend} disabled={!isConnected}>שלח</button>
      </div>
    </div>
  );
};

export default ChatBox;
export {}; // This makes the file a module
