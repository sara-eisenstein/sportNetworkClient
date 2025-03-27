import axios from "axios";
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import "./Chat.css";
import { getUserImage } from "../../services/userService";

interface User {
    userId: number;
    firstName: string;
    lastName: string;
    profileImage?: string;
}

const UsersList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [currentChatUserId, setCurrentChatUserId] = useState<number | null>(null);
    const [myUserId, setMyUserId] = useState<number | null>(null);

    // נשלוף את ה-UserId מהטוקן פעם אחת
    useEffect(() => {
        const token = localStorage.getItem("token");
        const decoded = token ? JSON.parse(atob(token.split(".")[1])) : null;
        const extractedUserId: number = Number(decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
        if (extractedUserId) setMyUserId(extractedUserId);
    }, []);

    // נביא את כל המשתמשים
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("https://localhost:7047/api/User");
                const usersWithImages = await Promise.all(
                    response.data.map(async (user: User) => {
                        try {
                            const profileImage = await getUserImage(user.userId);
                            return { ...user, profileImage };
                        } catch (error) {
                            console.error(`Error loading profile image for user ${user.userId}:`, error);
                            return user;
                        }
                    })
                );
                setUsers(usersWithImages);
                console.log('users with images', usersWithImages);
            } catch (error) {
                console.error("שגיאה בעת שליפת המשתמשים:", error);
            }
        };

        fetchUsers();
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
                                    <div className="user-avatar">
                                        {user.profileImage ? (
                                            <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                                        ) : (
                                            `${user.firstName[0]}${user.lastName[0]}`
                                        )}
                                    </div>
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
                                    <div className="user-avatar">
                                        {(() => {
                                            const currentUser = users.find(u => u.userId === currentChatUserId);
                                            return currentUser?.profileImage ? (
                                                <img src={currentUser.profileImage} alt={`${currentUser.firstName} ${currentUser.lastName}`} />
                                            ) : (
                                                `${currentUser?.firstName[0]}${currentUser?.lastName[0]}`
                                            );
                                        })()}
                                    </div>
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