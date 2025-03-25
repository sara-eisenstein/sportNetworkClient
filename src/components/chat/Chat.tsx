import axios from "axios";
import React, { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import "../styles/chat.css";

interface User {
    userId: number;
    firstName: string;
    lastName: string;
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
        axios.get("https://localhost:7047/api/User")
            .then((response) => {
                setUsers(response.data);
                console.log('users', response.data);
            })
            .catch((error) => console.error("שגיאה בעת שליפת המשתמשים:", error));
    }, []);

    const startChat = (recipientId: number) => {
        setCurrentChatUserId(recipientId);
    };

    return (
        <div className="users-list">
            <h2>בחר משתמש להתחיל שיחה:</h2>
            <ul className="user-list-ul">
                {users
                    .filter((user) => user.userId !== myUserId) // לא מציג את עצמי
                    .map((user) => (
                        <li key={user.userId} className="user-list-item">
                            <span className="user-name">{user.firstName} {user.lastName}</span>
                            <button className="start-chat-btn" onClick={() => startChat(user.userId)}>
                                צ'אט עם {user.firstName} {user.lastName}
                            </button>
                        </li>
                    ))}
            </ul>

            {currentChatUserId !== null && myUserId !== null && (
                <div className="chat-container">
                    <h3>שיחה עם {users.find((u) => u.userId === currentChatUserId)?.firstName}</h3>
                    <ChatBox recipientId={currentChatUserId} userId={myUserId} />
                </div>
            )}
        </div>
    );
};

export default UsersList;