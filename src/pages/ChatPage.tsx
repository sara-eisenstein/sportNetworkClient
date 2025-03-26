import React from 'react';
import Chat from '../components/chat/Chat';
import './ChatPage.css';

const ChatPage: React.FC = () => {
    return (
        <div className="chat-page-container">
            <div className="chat-page-header">
                <h1>צ'אט</h1>
            </div>
            <div className="chat-page-content">
                <div className="chat-main">
                    <div className="chat-container">
                        <Chat />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
