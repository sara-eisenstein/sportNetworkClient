import React, { useEffect, useState } from "react";
import chatService from "../../services/chatService";
import { getUserImage } from "../../services/userService";

interface ChatBoxProps {
  recipientId: number;
  userId: number;
}

interface Message {
  SenderId?: number;
  senderId?: number;
  RecipientId: number;
  MessageContent: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ recipientId, userId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [myName, setMyName] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // לבדוק אם יש עוד הודעות להביא
  const [isLoadingMore, setIsLoadingMore] = useState(false); // טוען הודעות ישנות
  const messagesContainerRef = React.useRef<HTMLDivElement>(null);

  // פונקציה לטעינת תמונת פרופיל
  const loadProfileImage = async (userId: number | undefined): Promise<string> => {
    try {
      if (!userId) {
        console.warn('Attempted to load profile image for undefined userId');
        return '/default-avatar.webp';
      }
      return await getUserImage(userId);
    } catch (error) {
      console.error('Error loading profile image:', error);
      return '/default-avatar.webp';
    }
  };

  // פונקציית עזר לקבלת מזהה השולח
  const getSenderId = (msg: Message): number | undefined => {
    return msg.SenderId || msg.senderId;
  };

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
      chatService.onMessage(async (msg: any) => {
        console.log('WebSocket message received:', msg);
        const senderId = getSenderId(msg);
        if (
          (senderId === recipientId && msg.RecipientId === userId) ||
          (senderId === userId && msg.RecipientId === recipientId)
        ) {
          console.log('Message matches current chat:', { msg, recipientId, userId });
          
          // טעינת תמונת פרופיל למשתמש
          const profileImage = await loadProfileImage(senderId);
          
          setMessages((prev) => {
            const isDuplicate = prev.some(
              existingMsg => existingMsg.MessageContent === msg.MessageContent
            );
            
            if (isDuplicate) {
              console.log('Duplicate message found, skipping:', msg.MessageContent);
              return prev;
            }
            
            console.log('Adding new message:', msg.MessageContent);
            return [...prev, { ...msg, profileImage }];
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

  // טעינת הודעות ישנות עם תמונות פרופיל 
  useEffect(() => {
    const initialLoad = async () => {
      console.log('Loading initial messages for:', { userId, recipientId });
      const initialMessages = await chatService.fetchOldMessages(userId, recipientId, 1);
      console.log("Raw messages from server:", initialMessages);
      
      if (!initialMessages || initialMessages.length === 0) {
        console.log('No messages found');
        setMessages([]);
        setHasMore(false);
        return;
      }

      // טעינת תמונות פרופיל לכל ההודעות
      const messagesWithImages = await Promise.all(
        initialMessages.map(async (msg) => {
          try {
            console.log('Processing message:', msg);
            const senderId = getSenderId(msg);
            const profileImage = await loadProfileImage(senderId);
            return { ...msg, profileImage };
          } catch (error) {
            console.error('Error processing message:', msg, error);
            return { ...msg, profileImage: '/default-avatar.webp' };
          }
        })
      );
      
      console.log('Processed messages with images:', messagesWithImages);
      setMessages(messagesWithImages.reverse());
      setPage(2);
      if (initialMessages.length < 5) setHasMore(false);
    };
    
    if (recipientId && userId) {
      initialLoad();
    }
  }, [recipientId, userId]);

  const handleSend = async () => {
    if (!message.trim()) return; // אם ההודעה ריקה, לא נשלח
    if (!chatService.isSocketConnected()) {
      console.error("Can't send: WebSocket not connected yet");
      return;
    }
    
    const token = localStorage.getItem("token");
    const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
    const firstName = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || "";
    const lastName = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] || "";
    
    // טעינת תמונת פרופיל של המשתמש השולח
    const profileImage = await loadProfileImage(userId);
    
    const payload = { 
      SenderId: userId, 
      RecipientId: recipientId, 
      MessageContent: message, 
      userName: myName,
      firstName,
      lastName,
      profileImage
    };

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
    setIsLoadingMore(true);
    console.log('Loading more messages, current page:', page);
    const oldMessages = await chatService.fetchOldMessages(userId, recipientId, page);
    console.log('Raw old messages:', oldMessages);

    if (!oldMessages || oldMessages.length === 0) {
      console.log('No more messages to load');
      setHasMore(false);
      setIsLoadingMore(false);
      return;
    }

    // טעינת תמונות פרופיל לכל ההודעות
    const messagesWithImages = await Promise.all(
      oldMessages.map(async (msg) => {
        try {
          console.log('Processing old message:', msg);
          const senderId = getSenderId(msg);
          const profileImage = await loadProfileImage(senderId);
          return { ...msg, profileImage };
        } catch (error) {
          console.error('Error processing old message:', msg, error);
          return { ...msg, profileImage: '/default-avatar.webp' };
        }
      })
    );

    console.log('Processed old messages with images:', messagesWithImages);
    setMessages((prev) => [...messagesWithImages.reverse(), ...prev]);
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

    setIsLoadingMore(false);
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
            <div className="message-sender-info">
              <div className="user-avatar">
                {msg.profileImage ? (
                  <img src={msg.profileImage} alt={`${msg.firstName} ${msg.lastName}`} />
                ) : (
                  `${msg.firstName?.[0]}${msg.lastName?.[0]}`
                )}
              </div>
              <span className="sender-name">{msg.userName}</span>
            </div>
            <div className="message-content">{msg.MessageContent}</div>
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
