import React, { useState, useEffect, useRef } from 'react';
import './ChatSidebar.css';
import socketIOClient from 'socket.io-client';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

const ChatSidebar = () => {
    const [messages, setMessages] = useState([]);
    const [theme, setTheme] = useState('light');
    const inputRef = useRef(null);
    const socket = useRef(null);

    useEffect(() => {
        socket.current = socketIOClient('http://localhost:3001');

        socket.current.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });


        return () => {
            socket.current.disconnect();
        };
    }, []);



    const handleMessageSend = (event) => {
        event.preventDefault();

        const inputValue = inputRef.current.value.trim();

        if (inputValue === '') {
            return;
        }

        // Creating a new message object
        const newMessage = {
            content: inputValue,
            sender: messages.length % 2 === 0 ? 'User1' : 'User2',
            timestamp: new Date().toISOString(),
          };

        // Emitting the new message to the server
        socket.current.emit('sendMessage', newMessage);

        inputRef.current.value = '';
    };

    const handleThemeToggle = () => {
        // Toggling between light and dark themes
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleCodeHighlight = (message) => {
        const codeRegex = /```([\s\S]+?)```/g; // Regex to identify code snippets

        // Highlighting code snippets using Prism.js
        const highlightedMessage = message.replace(codeRegex, (match, code) => {
            const highlightedCode = Prism.highlight(code, Prism.languages.javascript, 'javascript');

            return `<pre class="language-javascript"><code>${highlightedCode}</code></pre>`;
        });

        return highlightedMessage;
    };

    return (
        <div className={`chat-sidebar ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
            <div className="chat-header">
                <h2>Chat</h2>
                <div className="toggle-switch" onClick={handleThemeToggle}>
                    <div className={`switch ${theme === 'dark' ? 'dark' : 'light'}`}>
                        {theme === 'light' ? (
                            <i className="fas fa-sun" style={{ color: '#fefffe' }}></i>
                        ) : (
                            <i className="fas fa-moon" style={{ color: '#FFD700' }}></i>
                        )}
                    </div>
                </div>
            </div>
            <div className="chat-messages">
                {/* Rendering chat messages */}
                {messages.map((message) => (
                    <div key={message.timestamp} className={`chat-message ${message.sender === 'User1' ? 'right' : 'left'}`}>
                        <div className="sender-avatar">{message.sender[0]}</div>
                        <div className="message-content">
                            <div className="message-sender">{message.sender}</div>
                            {/* Displaying message content with code highlighting */}
                            <div
                                className="message-text"
                                dangerouslySetInnerHTML={{ __html: handleCodeHighlight(message.content) }}
                            ></div>
                            <div className="message-timestamp">{message.timestamp}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <textarea placeholder="Type your message..." ref={inputRef} />
                <button onClick={handleMessageSend}>Send</button>
            </div>
        </div>
    );
};

export default ChatSidebar;
