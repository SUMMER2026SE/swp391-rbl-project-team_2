import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
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
  Loader,
  X
} from 'lucide-react';
import { useConversations } from '../hooks/useConversations';
import { landlordService } from '../services/landlordService';
import './MessagesPage.css';

const MessagesPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialConversationId = searchParams.get('conversationId');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState('');
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [attachment, setAttachment] = useState(null); // { fileUrl, messageType, fileName }
  const [isUploading, setIsUploading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const { 
    conversations, 
    currentConversation, 
    loading, 
    fetchConversationById, 
    sendMessage,
    createConversation
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
    const hasText = messageText.trim() !== '';
    const hasAttachment = attachment !== null;
    if ((!hasText && !hasAttachment) || !selectedConversationId) return;

    try {
      setIsSending(true);
      await sendMessage(
        selectedConversationId, 
        messageText.trim(),
        attachment ? attachment.messageType : 'text',
        attachment ? attachment.fileUrl : null,
        attachment ? attachment.fileName : null
      );
      setMessageText('');
      setAttachment(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error(t('messages.fileSizeLimit', 'File size must be less than 50MB'));
      return;
    }

    try {
      setIsUploading(true);
      const res = await landlordService.uploadChatAttachment(file);
      const fileData = res?.data || res;
      if (fileData && fileData.fileUrl) {
        setAttachment({
          fileUrl: fileData.fileUrl,
          messageType: fileData.messageType || 'file',
          fileName: fileData.fileName || file.name,
        });
        toast.success(t('messages.fileUploaded', 'File uploaded successfully!'));
      } else {
        toast.error('Failed to parse uploaded file data.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateNewChat = async (e) => {
    e.preventDefault();
    if (!newChatEmail.trim()) return;
    try {
      setIsCreatingChat(true);
      const conv = await createConversation(newChatEmail.trim());
      setShowNewChatModal(false);
      setNewChatEmail('');
      handleSelectConversation(conv.conversationId || conv.id);
      toast.success(t('messages.chatCreated', 'Conversation created successfully!'));
    } catch (err) {
      // Don't show toast if it's already handled, or just show error
      // The API error message might already be in err.message
    } finally {
      setIsCreatingChat(false);
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
        <p>{t('messages.loadingMessages', 'Loading messages...')}</p>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* LEFT PANEL */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>{t('messages.messages', 'Messages')}</h2>
          <button className="btn-new-message" title="New Message" onClick={() => setShowNewChatModal(true)}>
            <SquarePen size={18} />
          </button>
        </div>
        
        <div className="conversations-search">
          <Search size={16} />
          <input
            type="text"
            placeholder={t('messages.searchConversationsPlaceholder', 'Search conversations...')}
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
              <p>{t('messages.noConversationsFound', 'No conversations found')}</p>
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
                currentConversation.messages.map((msg, idx) => {
                  const isSent = (msg.sender_id || msg.senderId) === currentConversation.userId;
                  const hasImage = msg.messageType === 'image' || msg.message_type === 'image';
                  const hasVideo = msg.messageType === 'video' || msg.message_type === 'video';
                  const hasFile = msg.messageType === 'file' || msg.message_type === 'file';
                  const fileUrl = msg.fileUrl || msg.file_url;
                  const fileName = msg.fileName || msg.file_name;
                  
                  return (
                    <div
                      key={idx}
                      className={`message-bubble ${isSent ? 'sent' : 'received'}`}
                    >
                      <div className="message-content">
                        {hasImage && fileUrl && (
                          <div className="chat-media-wrapper">
                            <img 
                              src={fileUrl.startsWith('http') ? fileUrl : `http://localhost:5000${fileUrl}`} 
                              alt={fileName || "Attachment"} 
                              className="chat-image" 
                              onClick={() => window.open(fileUrl.startsWith('http') ? fileUrl : `http://localhost:5000${fileUrl}`, '_blank')}
                            />
                          </div>
                        )}
                        {hasVideo && fileUrl && (
                          <div className="chat-media-wrapper">
                            <video 
                              src={fileUrl.startsWith('http') ? fileUrl : `http://localhost:5000${fileUrl}`} 
                              controls 
                              className="chat-video" 
                            />
                          </div>
                        )}
                        {hasFile && fileUrl && (
                          <div className="chat-media-wrapper">
                            <a 
                              href={fileUrl.startsWith('http') ? fileUrl : `http://localhost:5000${fileUrl}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="chat-file-link"
                            >
                              <Paperclip size={14} style={{ marginRight: '4px' }} />
                              <span>{fileName || 'Download attachment'}</span>
                            </a>
                          </div>
                        )}
                        {msg.content && !['[Hình ảnh]', '[Video]'].includes(msg.content) && (
                          <p className="message-text">{msg.content}</p>
                        )}
                        <span className="message-time">
                          {(msg.created_at || msg.createdAt) ? new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-messages">
                  <p>{t('messages.noMessagesYetSayHello', 'No messages yet. Say hello!')}</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Attachment Preview (if any) */}
            {attachment && (
              <div className="chat-attachment-preview">
                <div className="preview-file-info">
                  {attachment.messageType === 'image' ? (
                    <img 
                      src={attachment.fileUrl.startsWith('http') ? attachment.fileUrl : `http://localhost:5000${attachment.fileUrl}`} 
                      alt="Preview" 
                      className="preview-thumbnail" 
                    />
                  ) : (
                    <div className="preview-file-icon">
                      <Paperclip size={24} />
                    </div>
                  )}
                  <div className="preview-file-details">
                    <h4>{attachment.fileName || (attachment.messageType === 'image' ? 'Image' : attachment.messageType === 'video' ? 'Video' : 'File')}</h4>
                    <span>{attachment.messageType.toUpperCase()}</span>
                  </div>
                </div>
                <button type="button" className="btn-remove-attachment" onClick={handleRemoveAttachment}>
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Input Form at Bottom */}
            <form className="message-input-form" onSubmit={handleSendMessage}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                accept="image/*,video/*" 
              />
              
              <button 
                type="button" 
                className="btn-attach" 
                title={t('messages.attachFile', 'Attach Image/Video')}
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending || isUploading}
              >
                {isUploading ? <Loader size={18} className="spinner" /> : <Paperclip size={18} />}
              </button>

              <input
                type="text"
                className="message-input"
                placeholder={t('messages.typeYourMessagePlaceholder', 'Type your message...')}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={isSending || isUploading}
              />
              
              <button 
                type="submit" 
                className="btn-send"
                disabled={isSending || isUploading || (!messageText.trim() && !attachment)}
              >
                {isSending ? <Loader size={18} className="spinner" /> : <Send size={18} />}
              </button>
            </form>
          </>
        ) : (
          <div className="empty-chat-panel">
            <Sparkles size={48} className="empty-icon" />
            <h2>{t('messages.selectAConversation', 'Select a conversation')}</h2>
            <p>{t('messages.chooseAConversationFromThe', 'Choose a conversation from the sidebar to start chatting.')}</p>
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay">
          <div className="modal-content new-chat-modal">
            <div className="modal-header">
              <h2>{t('messages.startNewChat', 'Start New Chat')}</h2>
              <button className="btn-close" onClick={() => setShowNewChatModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateNewChat} className="modal-body">
              <div className="form-group">
                <label>{t('messages.enterUserEmail', 'Enter User Email Address')}</label>
                <input
                  type="email"
                  value={newChatEmail}
                  onChange={(e) => setNewChatEmail(e.target.value)}
                  placeholder="tenant@example.com"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowNewChatModal(false)}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn-submit" 
                  disabled={isCreatingChat || !newChatEmail.trim()}
                >
                  {isCreatingChat ? <Loader size={16} className="spinner" /> : t('messages.startChat', 'Start Chat')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
