import React, { useEffect, useState } from "react";
import chatService from "../../services/chatService";
import { getUserImage } from "../../services/userService";

interface ChatBoxProps {
  recipientId: number;
  userId: number;
  recipientName: string;
}

interface Message {
  SenderId?: number;
  senderId?: number;
  RecipientId: number;
  MessageContent?: string;
  messageContent?: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ recipientId, userId, recipientName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [myName, setMyName] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

  // פונקציית עזר לקבלת תוכן ההודעה
  const getMessageContent = (msg: Message): string => {
    return msg.MessageContent || msg.messageContent || '';
  };

  useEffect(() => {
    // חיפוש שם המשתמש מתוך הטוקן
    const token = localStorage.getItem("token");
    const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
    console.log('Token decoded data:', decoded);

    // ניסיון לפענח את השם בקידוד נכון
    const userNameFromToken = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Unknown";
    const firstNameFromToken = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || "";
    const lastNameFromToken = decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] || "";

    console.log('Names from token:', {
      userNameFromToken,
      firstNameFromToken,
      lastNameFromToken
    });

    // ניסיון לתקן את הקידוד
    const decodeName = (name: string): string => {
      try {
        // ניסיון לפענח URI-encoded string
        return decodeURIComponent(escape(name));
      } catch (e) {
        console.error('Error decoding name:', e);
        return name;
      }
    };

    setMyName(decodeName(userNameFromToken));

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
              existingMsg => getMessageContent(existingMsg) === getMessageContent(msg)
            );
            
            if (isDuplicate) {
              console.log('Duplicate message found, skipping:', getMessageContent(msg));
              return prev;
            }
            
            // פענוח השם
            const decodeName = (name: string): string => {
              try {
                return decodeURIComponent(escape(name));
              } catch (e) {
                console.error('Error decoding name:', e);
                return name;
              }
            };

            // אם ההודעה היא מהמשתמש הנוכחי, נוסיף את המידע מהטוקן
            const messageToAdd = senderId === userId ? {
              ...msg,
              profileImage,
              userName: decodeName(userNameFromToken),
              firstName: decodeName(firstNameFromToken),
              lastName: decodeName(lastNameFromToken)
            } : {
              ...msg,
              profileImage,
              userName: recipientName,
              firstName: msg.firstName ? decodeName(msg.firstName) : '',
              lastName: msg.lastName ? decodeName(msg.lastName) : ''
            };
            
            console.log('Adding new message:', messageToAdd);
            return [...prev, messageToAdd];
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

      // פונקציה לפענוח שמות
      const decodeName = (name: string): string => {
        try {
          return decodeURIComponent(escape(name));
        } catch (e) {
          console.error('Error decoding name:', e);
          return name;
        }
      };

      // טעינת תמונות פרופיל לכל ההודעות
      const messagesWithImages = await Promise.all(
        initialMessages.map(async (msg) => {
          try {
            console.log('Processing message:', msg);
            const senderId = getSenderId(msg);
            const profileImage = await loadProfileImage(senderId);

            // אם ההודעה היא מהמשתמש הנוכחי, נשתמש בשם מהטוקן
            if (senderId === userId) {
              const token = localStorage.getItem("token");
              const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
              const firstName = decodeName(decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || "");
              const lastName = decodeName(decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] || "");
              const userName = decodeName(decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Unknown");
              
              return {
                ...msg,
                profileImage,
                userName,
                firstName,
                lastName
              };
            }

            // אם זו הודעה מהצד השני, נשתמש בשם שקיבלנו כפרופ
            return {
              ...msg,
              profileImage,
              userName: recipientName,
              firstName: msg.firstName ? decodeName(msg.firstName) : '',
              lastName: msg.lastName ? decodeName(msg.lastName) : ''
            };
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
    if (!message.trim()) return;
    if (!chatService.isSocketConnected()) {
      console.error("Can't send: WebSocket not connected yet");
      return;
    }
    
    const token = localStorage.getItem("token");
    const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
    
    // טעינת תמונת פרופיל של המשתמש השולח
    const profileImage = await loadProfileImage(userId);
    
    const payload = { 
      SenderId: userId, 
      RecipientId: recipientId, 
      MessageContent: message, 
      userName: myName,
      firstName: decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || "",
      lastName: decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] || "",
      profileImage
    };

    console.log('Sending message with payload:', payload);

    // שליחה לשרת
    chatService.sendMessage(payload);

    // הוספת ההודעה למצב המקומי
    setMessages(prev => [...prev, payload]);

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

    // פונקציה לפענוח שמות
    const decodeName = (name: string): string => {
      try {
        return decodeURIComponent(escape(name));
      } catch (e) {
        console.error('Error decoding name:', e);
        return name;
      }
    };

    // טעינת תמונות פרופיל לכל ההודעות
    const messagesWithImages = await Promise.all(
      oldMessages.map(async (msg) => {
        try {
          console.log('Processing old message:', msg);
          const senderId = getSenderId(msg);
          const profileImage = await loadProfileImage(senderId);

          // אם ההודעה היא מהמשתמש הנוכחי, נשתמש בשם מהטוקן
          if (senderId === userId) {
            const token = localStorage.getItem("token");
            const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
            const firstName = decodeName(decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"] || "");
            const lastName = decodeName(decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"] || "");
            const userName = decodeName(decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Unknown");
            
            return {
              ...msg,
              profileImage,
              userName,
              firstName,
              lastName
            };
          }

          // אם זו הודעה מהצד השני, נפענח את השמות שהגיעו מהשרת
          return {
            ...msg,
            profileImage,
            userName: recipientName,
            firstName: msg.firstName ? decodeName(msg.firstName) : '',
            lastName: msg.lastName ? decodeName(msg.lastName) : ''
          };
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
        {messages.map((msg, idx) => {
          const isSentByMe = (msg.SenderId || msg.senderId) === userId;
          const displayName = isSentByMe ? myName : recipientName;
          
          return (
            <div key={idx} className={`chat-message ${isSentByMe ? "my-message" : "other-message"}`}>
              <div className="message-sender-info">
                <div className="user-avatar">
                  {msg.profileImage ? (
                    <img src={msg.profileImage} alt={displayName} />
                  ) : (
                    displayName.split(' ').map(name => name[0]).join('')
                  )}
                </div>
                <span className="sender-name">{displayName}</span>
              </div>
              <div className="message-content">{getMessageContent(msg)}</div>
            </div>
          );
        })}
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
