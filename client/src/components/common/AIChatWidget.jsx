import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import './AIChatWidget.css';

// Renders text with clickable links
const MessageContent = ({ content }) => {
  const navigate = useNavigate();
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  // Reset regex state after split
  urlRegex.lastIndex = 0;

  return (
    <span>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          const isLocal = part.includes('localhost:5173');
          if (isLocal) {
            const path = part.replace(/https?:\/\/localhost:\d+/, '');
            return (
              <button
                key={i}
                onClick={() => navigate(path)}
                className="ai-room-link"
              >
                🔗 Xem chi tiết phòng
              </button>
            );
          }
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="ai-room-link">
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

const AIChatWidget = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am RoomMaster AI. How can I help you find a room today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', { 
        message: userMsg.content,
        history: messages
      });
      
      if (response.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now.' }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Oops, something went wrong on my end!' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'TENANT') {
    return null;
  }

  return (
    <div className="ai-chat-widget">
      {isOpen ? (
        <div className="ai-chat-window">
          <div className="ai-chat-header">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <h4>AI Assistant</h4>
            </div>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="ai-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-message ${msg.role}`}>
                <div className="ai-message-bubble">
                  <MessageContent content={msg.content} />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="ai-message assistant">
                <div className="ai-message-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="ai-chat-input">
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button className="ai-chat-toggle" onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;
