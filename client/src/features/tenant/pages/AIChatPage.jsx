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
      type: 'text_with_chips',
      text: "Hello! I'm your SmartBoard Assistant. I can help you find your next home, manage your current lease, or answer any questions about our properties.\n\nHere are a few things you can ask me:",
      chips: ["Find a 2-bedroom", "Book a tour", "Maintenance help"]
    },
    {
      id: 2,
      sender: 'user',
      type: 'text',
      text: "I'm looking for a 1-bedroom apartment in the Westside area. My budget is around $2,500/month, and I need it to be pet-friendly."
    },
    {
      id: 3,
      sender: 'bot',
      type: 'text_with_cards',
      text: "I found a few excellent options for you in Westside that are pet-friendly and within your budget. Here are the top matches:",
      cards: [
        {
          id: 1,
          title: 'The Westland Lofts',
          price: 2300,
          location: 'Westside District',
          tags: ['1 Bed', '1 Bath'],
          imageTags: [{ text: '🐾 Pet Friendly', type: 'pet' }],
          image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500&auto=format&fit=crop&q=60'
        },
        {
          id: 2,
          title: 'Lumina Apartments',
          price: 2450,
          location: 'Westside Heights',
          tags: ['1 Bed', '1.5 Bath'],
          imageTags: [{ text: '🐾 Pet Friendly', type: 'pet' }],
          image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&auto=format&fit=crop&q=60'
        }
      ]
    }
  ];

  const SUGGESTED_PROMPTS = [
    { text: "Show me available studio apartments in downtown under...", icon: Home },
    { text: "How do I split my upcoming rent payment?", icon: MessageSquare },
    { text: "Submit a maintenance request for a leaky faucet.", icon: Paperclip }
  ];

  const RECENT_CHATS = [
    "Lease renewal terms",
    "Pet policy clarification",
    "Gym access hours"
  ];

  return (
    <div className="ai-chat-page">
      {/* Sidebar */}
      <aside className="chat-sidebar">
        <div className="sidebar-header">
          <div className="bot-icon-wrapper">
            <Bot size={24} className="text-primary" />
          </div>
          <div className="bot-info">
            <h2>AI Assistant</h2>
            <p>SmartBoard Help</p>
          </div>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>SUGGESTED</h3>
            <ul className="prompt-list">
              {SUGGESTED_PROMPTS.map((prompt, idx) => {
                const IconComponent = prompt.icon;
                return (
                  <li key={idx} className="prompt-item">
                    <IconComponent size={18} className="text-muted flex-shrink-0" />
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
                  <MessageSquare size={18} className="text-muted flex-shrink-0" />
                  <span>{chat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="sidebar-footer">
          <button className="new-chat-btn">
            + New Conversation
          </button>
        </div>
      </aside>

      {/* Main Chat Window */}
      <main className="chat-main">
        <div className="chat-messages">
          <div className="date-divider">
            <span>Today</span>
          </div>

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

                  {/* Chips */}
                  {msg.type === 'text_with_chips' && msg.chips && (
                    <div className="message-chips">
                      {msg.chips.map((chip, idx) => (
                        <button key={idx} className="chip-btn">{chip}</button>
                      ))}
                    </div>
                  )}

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
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User" />
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
              placeholder="Type your message or ask for recommendations..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button className="btn-send">
              <Send size={18} className="text-white" />
            </button>
          </div>
          <p className="chat-disclaimer">
            AI Assistant can make mistakes. Verify important information.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AIChatPage;
