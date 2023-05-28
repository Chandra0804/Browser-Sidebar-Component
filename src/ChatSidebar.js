import React, { useState, useEffect, useRef } from 'react';
import './ChatSidebar.css'; // Styling for the sidebar
import socketIOClient from 'socket.io-client';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';

const ChatSidebar = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: 'Hello there!',
      sender: 'User1',
      timestamp: '2023-05-28T12:34:56Z',
    },
    {
      id: 2,
      content: 'Hi! How can I help you?',
      sender: 'User2',
      timestamp: '2023-05-28T12:35:00Z',
    },
  ]);
  const [theme, setTheme] = useState('light');
  const [dropdownOpen, setDropdownOpen] = useState(false); // Track the open/closed state of the dropdown
  const inputRef = useRef(null); // Create a ref for the input element
  const socket = useRef(null); // Create a ref for the socket

  useEffect(() => {
    socket.current = socketIOClient('http://localhost:3001'); // Replace with your server URL

    socket.current.on('message', (message) => {
      // Update the messages state with the received message
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.current.disconnect(); // Clean up the socket connection on component unmount
    };
  }, []);

  const handleMessageSend = (event) => {
    event.preventDefault();

    const inputValue = inputRef.current.value.trim(); // Get the input value

    if (inputValue === '') {
      return;
    }

    const newMessage = {
      content: inputValue,
      sender: 'User1',
      timestamp: new Date().toISOString(),
    };

    // Update the messages state with the new message
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Send the message to the server
    socket.current.emit('sendMessage', newMessage);

    inputRef.current.value = ''; // Clear the input field
  };

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light')); // Toggle the theme
  };

  const handleCodeHighlight = (message) => {
    const codeRegex = /```([\s\S]+?)```/g; // Regex to identify code snippets
  
    const highlightedMessage = message.replace(codeRegex, (match, code) => {
      // Use Prism.js to apply syntax highlighting to the code
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
        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.sender === 'User1' ? 'right' : 'left'}`}>
            <div className="sender-avatar">{message.sender[0]}</div>
            <div className="message-content">
              <div className="message-sender">{message.sender}</div>
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
