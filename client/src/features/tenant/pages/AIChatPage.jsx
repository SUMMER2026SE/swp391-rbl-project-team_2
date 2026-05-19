import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, MessageSquare, Bot, Lightbulb, Compass, Home } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import './AIChatPage.css';

const AIChatPage = () => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const MOCK_MESSAGES = [
    {
      id: 1,
      sender: 'bot',
      type: 'text',
      text: "Hello! I'm your SmartBoard Assistant. How can I help you with your housing search today?"
    },
    {
      id: 2,
      sender: 'user',
      type: 'text',
      text: "I'm looking for a modern 1-bedroom apartment near the tech park. Needs to have good natural light and in-unit laundry. Budget is around $2,200."
    },
    {
      id: 3,
      sender: 'bot',
      type: 'text_with_cards',
      text: "I found a few great options that match your criteria near the tech park. They all feature modern amenities, excellent natural light, and in-unit laundry.\n\nHere are the top recommendations:",
      cards: [
        {
          id: 1,
          title: 'The Lumina Lofts',
          price: 2100,
          location: 'Tech Park District (0.5 miles)',
          tags: ['1 Bed', '1 Bath', 'In-unit W/D'],
          imageTags: [{ text: '★ Match', type: 'match' }],
          image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&auto=format&fit=crop&q=60'
        },
        {
          id: 2,
          title: 'Vertex Residences',
          price: 2250,
          location: 'Tech Park District (0.2 miles)',
          tags: ['1 Bed', '1.5 Bath', 'Gym'],
          imageTags: [],
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60'
        }
      ]
    }
  ];

  const SUGGESTED_PROMPTS = [
    { text: "Find pet-friendly apartments under $2000 in Downtown.", icon: Lightbulb },
    { text: "What are the best neighborhoods for young professionals?", icon: Compass },
    { text: "Show me places with a gym and pool.", icon: Home }
  ];

  const RECENT_CHATS = [
    "Studios in Northside",
    "Lease terms explanation",
    "Maintenance request status"
  ];

  return (
    <div className="ai-chat-page">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>SUGGESTED QUERIES</h3>
            <ul className="prompt-list">
              {SUGGESTED_PROMPTS.map((prompt, idx) => {
                const IconComponent = prompt.icon;
                return (
                  <li key={idx} className="prompt-item">
                    <IconComponent size={18} className="text-muted" />
                    <span>{prompt.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="sidebar-section">
            <h3>RECENT CHATS</h3>
            <ul className="history-list">
              {RECENT_CHATS.map((chat, idx) => (
                <li key={idx} className="history-item">
                  <MessageSquare size={18} className="text-muted" />
                  <span>{chat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Chat Window */}
      <main className="chat-main">
        <div className="chat-messages">
          {MOCK_MESSAGES.map(msg => (
            <div key={msg.id} className={`message-row ${msg.sender}`}>
              {msg.sender === 'bot' && (
                <div className="message-avatar bot-avatar">
                  <Bot size={20} className="text-white" />
                </div>
              )}
              
              <div className="message-content">
                <div className="message-bubble">
                  <p>{msg.text}</p>

                  {/* Optional Cards Grid */}
                  {msg.type === 'text_with_cards' && (
                    <div className="message-cards-grid">
                      {msg.cards.map(room => (
                        <RoomCard key={room.id} room={room} variant="chat" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="message-avatar user-avatar">
                  <img src="https://i.pravatar.cc/150?img=11" alt="User" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <button className="btn-attachment">
              <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              placeholder="Ask about properties, leases, or neighborhoods..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button className="btn-send">
              <Send size={18} className="text-white" />
            </button>
          </div>
          <p className="chat-disclaimer">
            AI can make mistakes. Verify important lease details.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AIChatPage;
