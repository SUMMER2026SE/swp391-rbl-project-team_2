import toast from 'react-hot-toast';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  SquarePen, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Image as ImageIcon, 
  Send, 
  Building,
  Sparkles,
  Loader
} from 'lucide-react';
import { useConversations } from '../hooks/useConversations';
import './MessagesPage.css';

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const initialConversationId = searchParams.get('conversationId');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { 
    conversations, 
    currentConversation, 
    loading, 
    fetchConversationById, 
    sendMessage 
  } = useConversations();

  // Handle ?conversationId=xxx in URL
  useEffect(() => {
    if (initialConversationId && conversations.length > 0) {
      const exists = conversations.find(c => c.conversation_id == initialConversationId);
      if (exists && selectedConversationId != initialConversationId) {
        handleSelectConversation(initialConversationId);
      }
    }
  }, [initialConversationId, conversations]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  const handleSelectConversation = async (conversationId) => {
    setSelectedConversationId(conversationId);
    try {
      await fetchConversationById(conversationId);
    } catch (err) {
      console.error('Error fetching conversation:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversationId) return;

    try {
      setIsSending(true);
      await sendMessage(selectedConversationId, messageText);
      setMessageText('');
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participant_1_id === conv.userId 
      ? conv.participant2 
      : conv.participant1;
    const participantName = (otherParticipant?.full_name || '').toLowerCase();
    const lastMessage = (conv.lastMessage || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return participantName.includes(search) || lastMessage.includes(search);
  });

  if (loading && conversations.length === 0) {
    return (
      <div className="messages-loading">
        <Loader size={32} className="spinner" />
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* LEFT PANEL */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button className="btn-new-message" title="New Message">
            <SquarePen size={18} />
          </button>
        </div>
        
        <div className="conversations-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="conversations-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conv => {
              const otherParticipant = conv.participant_1_id === conv.userId 
                ? conv.participant2 
                : conv.participant1;
              
              return (
                <div
                  key={conv.conversation_id}
                  className={`conversation-item ${selectedConversationId == conv.conversation_id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv.conversation_id)}
                >
                  <div className="conversation-avatar">
                    {otherParticipant?.avatar_url ? (
                      <img src={otherParticipant.avatar_url} alt={otherParticipant?.full_name} />
                    ) : (
                      <span>{otherParticipant?.full_name?.charAt(0) || 'U'}</span>
                    )}
                    <div className={`online-indicator ${otherParticipant?.is_online ? 'online' : ''}`} />
                  </div>
                  <div className="conversation-info">
                    <h3 className="conversation-name">{otherParticipant?.full_name || 'Unknown User'}</h3>
                    <p className="conversation-snippet">
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-conversations">
              <p>No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="chat-window">
        {selectedConversationId && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-header-info">
                <h2 className="chat-participant-name">
                  {currentConversation.participant1Id === currentConversation.userId
                    ? (currentConversation.participant2?.full_name || 'Tenant')
                    : (currentConversation.participant1?.full_name || 'Tenant')}
                </h2>
                {currentConversation.room && (
                  <p className="chat-room-info">
                    <Building size={14} />
                    {currentConversation.room.title}
                  </p>
                )}
              </div>
              <button className="btn-chat-menu">
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="messages-area">
              {currentConversation.messages && currentConversation.messages.length > 0 ? (
                currentConversation.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message-bubble ${(msg.sender_id || msg.senderId) === currentConversation.userId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p className="message-text">{msg.content}</p>
                      <span className="message-time">
                        {(msg.created_at || msg.createdAt) ? new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-messages">
                  <p>No messages yet. Say hello!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form at Bottom */}
            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="message-input"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={isSending}
              />
              <button 
                type="submit" 
                className="btn-send"
                disabled={isSending || !messageText.trim()}
              >
                {isSending ? <Loader size={18} className="spinner" /> : <Send size={18} />}
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat-panel">
            <Sparkles size={48} className="empty-icon" />
            <h2>Select a conversation</h2>
            <p>Choose a conversation from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
