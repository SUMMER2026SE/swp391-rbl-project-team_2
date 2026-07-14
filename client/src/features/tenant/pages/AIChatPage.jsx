import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, MessageSquare, Bot, Home, Plus, Trash2, HelpCircle, ChevronRight, User } from 'lucide-react';
import { API_URL } from '../../../config';
import MarkdownRenderer from '../../../components/common/MarkdownRenderer';
import useAuthStore from '../../../store/useAuthStore';
import './AIChatPage.css';

const WELCOME_MESSAGE = {
  id: 'welcome',
  sender: 'bot',
  type: 'text',
  text: "Xin chào! 👋 Em là trợ lý RentWise AI. Em có thể hỗ trợ bạn tìm kiếm phòng trọ, giải đáp thắc mắc về chính sách thuê cọc, hợp đồng, hoặc giải đáp bất kỳ câu hỏi nào từ khoa học, nấu ăn, công nghệ, giải trí... Bạn cứ tự nhiên hỏi nhé! 😊"
};

const SUGGESTED_PROMPTS = [
  { text: "Tìm phòng trọ Quận 1 giá dưới 4 triệu?", icon: Home },
  { text: "Quy trình đặt cọc và thanh toán trên RentWise?", icon: HelpCircle },
  { text: "Giải thích nguyên lý hoạt động của lò vi sóng", icon: Bot }
];

const AIChatPage = () => {
  const { user } = useAuthStore();
  const userId = user?.user_id || 'guest';
  
  const [conversations, setConversations] = useState({});
  const [activeConvId, setActiveConvId] = useState('default');
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Load conversations from local storage
  useEffect(() => {
    const key = `rentwise-chat-history-${userId}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          setConversations(parsed);
          // Set first conversation active
          const keys = Object.keys(parsed);
          setActiveConvId(keys[0]);
          setMessages(parsed[keys[0]].messages || [WELCOME_MESSAGE]);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    // Default initial conversation if none exist
    const defaultConv = {
      id: 'default',
      title: 'Trò chuyện mới',
      messages: [WELCOME_MESSAGE]
    };
    setConversations({ default: defaultConv });
    setActiveConvId('default');
    setMessages([WELCOME_MESSAGE]);
  }, [userId]);

  // Save conversations to local storage
  const saveConversations = (updatedConvs) => {
    const key = `rentwise-chat-history-${userId}`;
    setConversations(updatedConvs);
    try {
      localStorage.setItem(key, JSON.stringify(updatedConvs));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  };

  // Start new conversation
  const handleNewConversation = () => {
    const id = `conv-${Date.now()}`;
    const newConv = {
      id,
      title: 'Trò chuyện mới',
      messages: [WELCOME_MESSAGE]
    };
    const updated = { [id]: newConv, ...conversations };
    saveConversations(updated);
    setActiveConvId(id);
    setMessages([WELCOME_MESSAGE]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Select a conversation
  const handleSelectConversation = (id) => {
    setActiveConvId(id);
    setMessages(conversations[id]?.messages || [WELCOME_MESSAGE]);
  };

  // Delete a conversation
  const handleDeleteConversation = (e, id) => {
    e.stopPropagation();
    const updated = { ...conversations };
    delete updated[id];

    if (Object.keys(updated).length === 0) {
      const defaultId = 'default';
      const defaultConv = {
        id: defaultId,
        title: 'Trò chuyện mới',
        messages: [WELCOME_MESSAGE]
      };
      saveConversations({ [defaultId]: defaultConv });
      setActiveConvId(defaultId);
      setMessages([WELCOME_MESSAGE]);
    } else {
      saveConversations(updated);
      if (activeConvId === id) {
        const nextId = Object.keys(updated)[0];
        setActiveConvId(nextId);
        setMessages(updated[nextId].messages || [WELCOME_MESSAGE]);
      }
    }
  };

  // Send message through stream (SSE)
  const handleSend = async (messageText) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    setInputMessage('');
    setIsLoading(true);

    const userMsgId = `user-${Date.now()}`;
    const newUserMsg = { id: userMsgId, sender: 'user', type: 'text', text: textToSend };
    
    // Update local messages state immediately
    const updatedMessages = [...messages.filter(m => m.id !== 'welcome' || m.text !== WELCOME_MESSAGE.text), newUserMsg];
    setMessages(updatedMessages);

    // Update conversation title based on user first message
    let convTitle = conversations[activeConvId]?.title || 'Trò chuyện mới';
    if (convTitle === 'Trò chuyện mới') {
      convTitle = textToSend.length > 25 ? textToSend.slice(0, 25) + '...' : textToSend;
    }

    const botMsgId = `bot-${Date.now()}`;
    const initialBotMsg = {
      id: botMsgId,
      sender: 'bot',
      type: 'stream',
      text: '',
      status: 'Connecting...',
      sources: [],
      followups: []
    };

    setMessages(prev => [...prev, initialBotMsg]);

    try {
      const authStorage = JSON.parse(sessionStorage.getItem('auth-storage'));
      const token = authStorage?.state?.token;

      // Extract last 7 messages for context
      const chatHistory = updatedMessages.slice(-7).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const response = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: textToSend,
          history: chatHistory,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error('Connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let botAnswer = '';
      let botSources = [];
      let botFollowups = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.type === 'status') {
                setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, status: data.status } : m));
              } else if (data.type === 'content') {
                botAnswer += data.delta;
                setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: botAnswer, status: null } : m));
              } else if (data.type === 'sources') {
                botSources = data.sources;
                setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, sources: botSources } : m));
              } else if (data.type === 'followup') {
                botFollowups = data.followup;
                setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, followups: botFollowups } : m));
              }
            } catch (e) {
              // Ignore parse errors on half-delivered frames
            }
          }
        }
      }

      // Save finalized conversation list to local storage
      const finalBotMsg = {
        id: botMsgId,
        sender: 'bot',
        type: 'text',
        text: botAnswer,
        sources: botSources,
        followups: botFollowups
      };

      const finalMessages = [...updatedMessages, finalBotMsg];
      const updatedConvs = {
        ...conversations,
        [activeConvId]: {
          id: activeConvId,
          title: convTitle,
          messages: finalMessages
        }
      };
      saveConversations(updatedConvs);
      setMessages(finalMessages);

    } catch (err) {
      console.error('[AIChatPage] Stream error:', err);
      const errorMsg = {
        id: botMsgId,
        sender: 'bot',
        type: 'text',
        text: 'Xin lỗi bạn, em đã gặp sự cố kết nối với hệ thống AI. Vui lòng gửi lại câu hỏi hoặc tải lại trang nhé ạ! 😭',
        sources: [],
        followups: []
      };
      const finalMessages = [...updatedMessages, errorMsg];
      const updatedConvs = {
        ...conversations,
        [activeConvId]: {
          id: activeConvId,
          title: convTitle,
          messages: finalMessages
        }
      };
      saveConversations(updatedConvs);
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-chat-page-container">
      {/* Sidebar */}
      <aside className="chat-sidebar-custom">
        <div className="sidebar-header-custom">
          <div className="bot-avatar-icon-custom">
            <Bot size={22} className="text-primary" />
          </div>
          <div className="sidebar-bot-info">
            <h2>RentWise AI Assistant</h2>
            <p>Google AI & Perplexity Mode</p>
          </div>
        </div>

        <div className="new-chat-btn-container">
          <button className="new-chat-btn-custom" onClick={handleNewConversation}>
            <Plus size={16} />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        <div className="sidebar-scrollable-content">
          <div className="sidebar-section-custom">
            <h3>LỊCH SỬ TRÒ CHUYỆN</h3>
            <ul className="history-list-custom">
              {Object.values(conversations).map((conv) => (
                <li
                  key={conv.id}
                  className={`history-item-custom ${activeConvId === conv.id ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <MessageSquare size={16} className="text-muted flex-shrink-0" />
                  <span className="text-truncate">{conv.title}</span>
                  <button
                    className="delete-conv-btn"
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    title="Xóa lịch sử"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main-custom">
        <div className="chat-messages-custom">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row-custom ${msg.sender}`}>
              <div className={`message-avatar-custom ${msg.sender}-avatar`}>
                {msg.sender === 'bot' ? <Bot size={18} className="text-white" /> : <User size={18} className="text-white" />}
              </div>

              <div className="message-content-custom">
                {/* Search / Thinking Status Panel */}
                {msg.status && (
                  <div className="sse-status-badge py-2 px-3 bg-light rounded border d-inline-flex align-items-center gap-2 mb-2">
                    <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                    <span className="font-italic text-muted" style={{ fontSize: '0.85rem' }}>{msg.status}</span>
                  </div>
                )}

                <div className="message-bubble-custom">
                  {/* Sources Grid Card Header */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="citation-sources-box mb-3 p-3 bg-light rounded border">
                      <div className="text-muted small font-weight-bold mb-2">🌐 NGUỒN TÌM KIẾM TRÊN WEB:</div>
                      <div className="d-flex flex-wrap gap-2">
                        {msg.sources.map((src, sidx) => (
                          <a
                            key={sidx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="source-citation-card border rounded p-2 bg-white text-decoration-none text-main hover-shadow transition d-inline-flex flex-column"
                            style={{ minWidth: '150px', maxWidth: '200px' }}
                          >
                            <span className="source-index-number text-primary font-weight-bold" style={{ fontSize: '0.7rem' }}>
                              [{sidx + 1}] {src.website.toUpperCase()}
                            </span>
                            <span className="source-card-title text-truncate small font-weight-medium text-muted mt-1">
                              {src.title}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main Answer Content (Markdown parsed) */}
                  <MarkdownRenderer content={msg.text} />

                  {/* Follow-up recommendation chips */}
                  {msg.followups && msg.followups.length > 0 && (
                    <div className="followup-chips-box mt-4 border-top pt-3">
                      <div className="text-muted small font-weight-bold mb-2">💡 GỢI Ý CÂU HỎI TIẾP THEO:</div>
                      <div className="d-flex flex-wrap gap-2">
                        {msg.followups.map((q, qidx) => (
                          <button
                            key={qidx}
                            onClick={() => handleSend(q)}
                            className="followup-chip-btn btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5 transition text-left"
                            style={{ fontSize: '0.85rem', whiteSpace: 'normal', height: 'auto' }}
                          >
                            <span>{q}</span>
                            <ChevronRight size={14} className="ml-1 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Skeleton Pulse Loading effect */}
          {isLoading && messages[messages.length - 1]?.sender === 'user' && (
            <div className="message-row-custom bot loading-skeleton">
              <div className="message-avatar-custom bot-avatar">
                <Bot size={18} className="text-white" />
              </div>
              <div className="message-content-custom">
                <div className="sse-status-badge py-2 px-3 bg-light rounded border d-inline-flex align-items-center gap-2 mb-2">
                  <span className="spinner-border spinner-border-sm text-primary" role="status"></span>
                  <span className="font-italic text-muted" style={{ fontSize: '0.85rem' }}>Đang tìm kiếm thông tin...</span>
                </div>
                <div className="skeleton-chat-bubble border p-3 rounded bg-white">
                  <div className="skeleton-line w-75 mb-2"></div>
                  <div className="skeleton-line w-50 mb-2"></div>
                  <div className="skeleton-line w-25"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts on empty state */}
        {messages.length <= 1 && (
          <div className="suggested-prompts-container">
            <h3 className="suggested-prompts-title">💡 Gợi ý câu hỏi phổ biến:</h3>
            <div className="suggested-prompts-grid">
              {SUGGESTED_PROMPTS.map((prompt, idx) => {
                const IconComponent = prompt.icon;
                return (
                  <button
                    key={idx}
                    className="suggested-prompt-card"
                    onClick={() => handleSend(prompt.text)}
                  >
                    <IconComponent size={20} className="text-primary flex-shrink-0" />
                    <span>{prompt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="chat-input-container-custom">
          <div className="chat-input-wrapper-custom">
            <input
              ref={inputRef}
              type="text"
              placeholder="Hỏi về phòng trọ RentWise hoặc các chủ đề tổng quát..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={isLoading}
            />
            <button
              className="btn-send-custom"
              onClick={() => handleSend()}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
          <p className="chat-disclaimer-custom">
            Trợ lý AI RentWise có thể đưa ra câu trả lời chưa chính xác. Vui lòng kiểm tra lại thông tin quan trọng.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AIChatPage;
