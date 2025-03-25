import React from 'react';
import Chat from '../components/chat/Chat';

const ChatPage: React.FC = () => {
    return (
        <div className="chat-page">
            <h1>צ'אט</h1>
            <Chat />
        </div>
    );
};

export default ChatPage;
