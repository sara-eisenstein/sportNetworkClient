import axios from "axios";
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import "./Chat.css";
import { getUserImage } from "../../services/userService";

interface User {
    userId: number;
    firstName: string;
    lastName: string;
}

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentChatUserId, setCurrentChatUserId] = useState<number | null>(null);
    const [myUserId, setMyUserId] = useState<number | null>(null);
    const [profileImages, setProfileImages] = useState<{ [key: number]: string }>({});

    // נשלוף את ה-UserId מהטוקן פעם אחת
    useEffect(() => {
        const token = localStorage.getItem("token");
        const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
        const extractedUserId: number = Number(decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
        if (extractedUserId) setMyUserId(extractedUserId);
    }, []);

    // נביא את כל המשתמשים
    useEffect(() => {
        axios.get("https://localhost:7047/api/User")
            .then(async (response) => {
                const usersData = response.data;
                setUsers(usersData);
                console.log('users', usersData);

                // טעינת תמונות פרופיל לכל המשתמשים
                const imagePromises = usersData.map(async (user: User) => {
                    try {
                        const imageUrl = await getUserImage(user.userId);
                        return { userId: user.userId, imageUrl };
                    } catch (error) {
                        console.error(`שגיאה בטעינת תמונת פרופיל למשתמש ${user.userId}:`, error);
                        return { userId: user.userId, imageUrl: '/default-avatar.webp' };
                    }
                });

                const images = await Promise.all(imagePromises);
                const imagesMap = images.reduce((acc, { userId, imageUrl }) => {
                    acc[userId] = imageUrl;
                    return acc;
                }, {} as { [key: number]: string });
                
                setProfileImages(imagesMap);
            })
            .catch((error) => console.error("שגיאה בעת שליפת המשתמשים:", error));
    }, []);

    const startChat = (recipientId: number) => {
        setCurrentChatUserId(recipientId);
    };

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h2>משתתפים</h2>
                </div>
                <div className="chat-users-list">
                    {users
                        .filter((user) => user.userId !== myUserId)
                        .map((user) => (
                            <div 
                                key={user.userId} 
                                className={`chat-user-item ${currentChatUserId === user.userId ? 'active' : ''}`}
                            >
                                <div className="user-info">
                                    <img 
                                        src={profileImages[user.userId] || '/default-avatar.webp'}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        className="user-avatar"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (target.src !== '/default-avatar.webp') {
                                                target.src = '/default-avatar.webp';
                                            }
                                        }}
                                    />
                                    <span className="user-name">{user.firstName} {user.lastName}</span>
                                </div>
                                <button 
                                    className={`chat-action-btn ${currentChatUserId === user.userId ? 'active' : ''}`}
                                    onClick={() => startChat(user.userId)}
                                >
                                    {currentChatUserId === user.userId ? 'בשיחה' : 'התחל שיחה'}
                                </button>
                            </div>
                        ))}
                </div>
            </div>
            <div className="chat-main">
                {currentChatUserId !== null && myUserId !== null ? (
                    <div className="chat-box-container">
                        <div className="chat-box-header">
                            <div className="chat-box-header-content">
                                <div className="current-user-info">
                                    <img 
                                        src={profileImages[currentChatUserId] || '/default-avatar.webp'}
                                        alt={`${users.find(u => u.userId === currentChatUserId)?.firstName} ${users.find(u => u.userId === currentChatUserId)?.lastName}`}
                                        className="user-avatar"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            if (target.src !== '/default-avatar.webp') {
                                                target.src = '/default-avatar.webp';
                                            }
                                        }}
                                    />
                                    <h3>שיחה עם {users.find(u => u.userId === currentChatUserId)?.firstName}</h3>
                                </div>
                                <button 
                                    className="close-chat-btn"
                                    onClick={() => setCurrentChatUserId(null)}
                                >
                                    סיים שיחה
                                </button>
                            </div>
                        </div>
                        <ChatBox recipientId={currentChatUserId} userId={myUserId} />
                    </div>
                ) : (
                    <div className="no-chat-selected">
                        <h2>בחר משתמש מהרשימה כדי להתחיל שיחה</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersList;