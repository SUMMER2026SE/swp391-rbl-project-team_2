import React, { useState, useRef, useEffect } from 'react';
import { 
  SquarePen, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Image as ImageIcon, 
  Send, 
  Home, 
  FileText, 
  Download, 
  CheckCheck,
  Building,
  User,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';
import './MessagesPage.css';

const INITIAL_THREADS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    online: true,
    time: '10:42 AM',
    unread: true,
    snippet: "That sounds perfect, I'll send the documents over shortly.",
    property: 'Apt 4B – The Metro'
  },
  {
    id: 2,
    name: 'Marcus Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    online: false,
    time: 'Yesterday',
    unread: false,
    snippet: 'Is the maintenance request for the AC still pending?',
    property: 'Apt 12A – The Metro'
  },
  {
    id: 3,
    name: 'Elena Kowalski',
    avatar: '',
    initials: 'EK',
    online: true,
    time: 'Monday',
    unread: false,
    snippet: 'Signed_Lease_Agreement.pdf',
    hasAttachment: true,
    property: 'Apt 8C – The Metro'
  }
];

const INITIAL_CHAT_HISTORY = [
  {
    id: 1,
    sender: 'tenant',
    text: "Hi Admin, I was wondering if it's possible to extend my lease for another 6 months after October?",
    time: '10:15 AM'
  },
  {
    id: 2,
    sender: 'admin',
    text: "Hello Sarah! Yes, absolutely. You're a great tenant and we'd be happy to extend your lease.",
    time: '10:20 AM'
  },
  {
    id: 3,
    sender: 'admin',
    text: "I'll need to generate a new addendum for you to sign. Are the terms generally the same for you?",
    time: '10:20 AM',
    status: 'read'
  },
  {
    id: 4,
    sender: 'tenant',
    text: "Yes, same terms are fine. Could you also review this updated proof of income for the new term?",
    time: '10:35 AM',
    file: {
      name: 'Income_Verification_2024.pdf',
      size: '2.4 MB'
    }
  },
  {
    id: 5,
    sender: 'admin',
    text: "Got it. I'll review this and send the addendum shortly.",
    time: '10:36 AM',
    status: 'read'
  }
];

const MessagesPage = () => {
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState(1);
  const [activeTab, setActiveTab] = useState('All');
  const [chatHistory, setChatHistory] = useState(INITIAL_CHAT_HISTORY);
  const [newMessage, setNewMessage] = useState('');
  const chatBottomRef = useRef(null);

  // Auto scroll to chat bottom when messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    // Get current time
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour 0 should be 12
    const timeStr = `${hours}:${minutes} ${ampm}`;

    // Append to Chat
    const newMsgObj = {
      id: chatHistory.length + 1,
      sender: 'admin',
      text: newMessage,
      time: timeStr,
      status: 'sent'
    };

    setChatHistory(prev => [...prev, newMsgObj]);

    // Update thread snippet
    setThreads(prev => prev.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          snippet: newMessage,
          time: timeStr,
          unread: false
        };
      }
      return t;
    }));

    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredThreads = threads.filter(t => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return t.unread;
    if (activeTab === 'Tenants') return true; // in mock context all threads are tenants
    return true;
  });

  return (
    <div className="messages-page-wrapper">
      {/* 2-Column Split Chat Panel */}
      <div className="chat-panel">
        
        {/* Left Side: Threads Column */}
        <div className="threads-column">
          <div className="threads-header">
            <h2 className="threads-title">Messages</h2>
            <button className="btn-create-thread">
              <SquarePen size={18} />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="threads-filters">
            {['All', 'Unread', 'Tenants'].map(tab => (
              <button 
                key={tab} 
                className={`filter-pill ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Threads List */}
          <div className="threads-scroll-list">
            {filteredThreads.map(thread => (
              <div 
                key={thread.id} 
                className={`thread-item-card ${activeThreadId === thread.id ? 'active' : ''} ${thread.unread ? 'unread' : ''}`}
                onClick={() => {
                  setActiveThreadId(thread.id);
                  // Mark as read
                  setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread: false } : t));
                }}
              >
                {/* Avatar / Initials */}
                <div className="thread-avatar-wrapper">
                  {thread.avatar ? (
                    <img src={thread.avatar} alt={thread.name} className="thread-avatar-img" />
                  ) : (
                    <div className="thread-avatar-initials">{thread.initials}</div>
                  )}
                  {thread.online && <span className="online-green-dot"></span>}
                </div>

                {/* Snippet Meta */}
                <div className="thread-details">
                  <div className="thread-meta-row">
                    <span className="thread-name">{thread.name}</span>
                    <span className="thread-time">{thread.time}</span>
                  </div>
                  <p className="thread-snippet-text">{thread.snippet}</p>
                  
                  {/* Property subtitle */}
                  <div className="thread-property-row">
                    <Home size={12} className="property-icon-mini" />
                    <span>{thread.property}</span>
                  </div>
                </div>

                {/* Blue unread bullet */}
                {thread.unread && <div className="thread-unread-bullet"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Conversation Chat Pane */}
        <div className="chat-conversation-pane">
          {activeThread ? (
            <>
              {/* Thread Header */}
              <header className="chat-pane-header">
                <div className="active-user-info">
                  <div className="avatar-header-wrapper">
                    {activeThread.avatar ? (
                      <img src={activeThread.avatar} alt={activeThread.name} className="active-avatar-header" />
                    ) : (
                      <div className="active-avatar-initials-header">{activeThread.initials}</div>
                    )}
                    {activeThread.online && <span className="active-online-dot"></span>}
                  </div>
                  <div className="active-name-meta">
                    <h3 className="active-name-header">{activeThread.name}</h3>
                    <span className="active-status-label">Online now</span>
                  </div>
                </div>

                <div className="header-icon-actions">
                  <button className="chat-header-btn"><Search size={18} /></button>
                  <button className="chat-header-btn"><MoreVertical size={18} /></button>
                </div>
              </header>

              {/* Property Context Banner */}
              <div className="property-context-banner">
                <div className="property-banner-left">
                  <div className="property-banner-thumb">
                    <img 
                      src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=150" 
                      alt="Room Thumb" 
                      className="room-thumb-img" 
                    />
                  </div>
                  <div className="property-banner-meta">
                    <h4 className="property-banner-title">{activeThread.property}</h4>
                    <p className="property-banner-lease">Lease: Active • Ends Oct 2024</p>
                  </div>
                </div>
                <div className="property-banner-right">
                  <button className="btn-view-property-details">View Details</button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="chat-messages-body">
                {/* Date separator */}
                <div className="date-separator">
                  <span className="date-pill">Today</span>
                </div>

                {chatHistory.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`message-row ${msg.sender === 'admin' ? 'row-outgoing' : 'row-incoming'}`}
                  >
                    {/* Small avatar for incoming messages */}
                    {msg.sender === 'tenant' && (
                      <div className="msg-avatar-wrapper">
                        {activeThread.avatar ? (
                          <img src={activeThread.avatar} alt={activeThread.name} className="msg-avatar-img" />
                        ) : (
                          <div className="msg-avatar-initials">{activeThread.initials}</div>
                        )}
                      </div>
                    )}

                    {/* Chat Bubble content */}
                    <div className="message-bubble-wrapper">
                      <div className="message-bubble-box">
                        <p className="message-bubble-text">{msg.text}</p>

                        {/* Optional File Card block inside bubble */}
                        {msg.file && (
                          <div className="file-attachment-card">
                            <div className="file-card-icon">
                              <FileText size={20} />
                            </div>
                            <div className="file-card-details">
                              <span className="file-name">{msg.file.name}</span>
                              <span className="file-size">{msg.file.size}</span>
                            </div>
                            <button className="btn-download-file">
                              <Download size={16} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Time and checkmark meta */}
                      <div className="message-meta-row">
                        <span className="msg-time">{msg.time}</span>
                        {msg.sender === 'admin' && msg.status === 'read' && (
                          <CheckCheck size={14} className="checkmark-icon-blue" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Anchor for auto scroll */}
                <div ref={chatBottomRef}></div>
              </div>

              {/* Chat Input Sticky Bottom Bar */}
              <form onSubmit={handleSendMessage} className="chat-input-sticky-bar">
                <div className="input-bar-container">
                  {/* Left Attachment Actions */}
                  <div className="input-left-actions">
                    <button type="button" className="input-action-btn"><Paperclip size={18} /></button>
                    <button type="button" className="input-action-btn"><ImageIcon size={18} /></button>
                  </div>

                  {/* Center Text Field */}
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="chat-text-input-field"
                  />

                  {/* Right Send Trigger */}
                  <button type="submit" className="btn-send-message-bubble">
                    <Send size={16} />
                  </button>
                </div>
                <div className="input-subtext-tips">
                  Press Enter to send, Shift+Enter for new line
                </div>
              </form>
            </>
          ) : (
            <div className="empty-chat-state">
              <Sparkles size={48} className="empty-chat-icon" />
              <h3>Select a thread to begin</h3>
              <p>Connect with your tenants in real-time.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessagesPage;
