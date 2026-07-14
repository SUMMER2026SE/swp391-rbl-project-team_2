import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, RotateCcw, Minus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import RentalWiseIcon from './RentalWiseIcon';
import './AIChatWidget.css';

// =========================================================
// CONSTANTS
// =========================================================
const STORAGE_KEY_PREFIX = 'ai-chat-history';
const getStorageKey = (userId) => `${STORAGE_KEY_PREFIX}-${userId || 'guest'}`;
const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'Xin chào!  Em là trợ lý ảo RentalWise. Em có thể giúp bạn tìm phòng trọ, giải đáp thắc mắc về chính sách thuê phòng, hoặc tư vấn lựa chọn phòng phù hợp nhé ạ! '
};

const QUICK_REPLIES = [
  ' Có phòng nào trống không?',
  ' Phòng giá dưới 3 triệu?',
  ' Quy trình thuê phòng?',
  ' Chính sách đặt cọc?',
];

// =========================================================
// MESSAGE CONTENT RENDERER (with clickable links)
// =========================================================
const MessageContent = ({ content }) => {
  const navigate = useNavigate();
  const [checking, setChecking] = React.useState(false);

  // Tiền xử lý: chuyển markdown link [text](url) thành plain URL
  const preprocessed = content.replace(/\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, '$2');

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = preprocessed.split(urlRegex);
  urlRegex.lastIndex = 0;

  // Hàm clean URL: loại bỏ ký tự thừa cuối URL (dấu ), ], dấu phẩy, dấu chấm...)
  const cleanUrl = (url) => url.replace(/[)\],.;:!?]+$/, '');

  const handleRoomClick = async (path) => {
    // Trích xuất room ID từ path: /rooms/77 -> 77
    const roomIdMatch = path.match(/\/rooms\/(\d+)/);
    if (!roomIdMatch) {
      navigate(path);
      return;
    }

    const roomId = roomIdMatch[1];
    setChecking(true);
    try {
      const response = await api.get(`/rooms/${roomId}`);
      if (response && response.data) {
        navigate(`/rooms/${roomId}`); // Dùng path đã clean thay vì path gốc
      } else {
        alert(' Phòng này không tồn tại hoặc đã bị xóa. Vui lòng tìm phòng khác trên trang Khám phá nhé!');
      }
    } catch (err) {
      alert(' Phòng này không tồn tại hoặc đã bị xóa. Vui lòng tìm phòng khác trên trang Khám phá nhé!');
    } finally {
      setChecking(false);
    }
  };

  return (
    <span>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          const cleaned = cleanUrl(part);
          // Kiểm tra nếu là link "không khả dụng" (đã bị backend loại bỏ)
          if (cleaned.includes('[link không khả dụng]')) {
            return <span key={i} className="ai-room-link-invalid"> Link không khả dụng</span>;
          }
          const isLocal = cleaned.includes('localhost:5173');
          if (isLocal) {
            const path = cleaned.replace(/https?:\/\/localhost:\d+/, '');
            return (
              <button
                key={i}
                onClick={() => handleRoomClick(path)}
                className="ai-room-link"
                disabled={checking}
              >
                {checking ? ' Đang kiểm tra...' : ' Xem chi tiết phòng'}
              </button>
            );
          }
          return (
            <a key={i} href={cleaned} target="_blank" rel="noopener noreferrer" className="ai-room-link">
              {cleaned}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

// =========================================================
// MAIN COMPONENT
// =========================================================
const AIChatWidget = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Helper: load chat history cho user hiện tại
  const loadUserMessages = useCallback((userId) => {
    try {
      const saved = localStorage.getItem(getStorageKey(userId));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore */ }
    return [WELCOME_MESSAGE];
  }, []);

  const [messages, setMessages] = useState(() => loadUserMessages(user?.user_id));
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Khi user thay đổi (đăng nhập/đăng xuất), reload lịch sử chat riêng
  useEffect(() => {
    setMessages(loadUserMessages(user?.user_id));
  }, [user?.user_id, loadUserMessages]);

  // Lưu lịch sử chat vào localStorage (theo user ID)
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(getStorageKey(user?.user_id), JSON.stringify(messages));
    }
  }, [messages, user?.user_id]);

  // Lắng nghe URL search parameters để tự động chat khi tìm kiếm AI
  useEffect(() => {
    const aiQuery = searchParams.get('aiQuery');
    if (aiQuery) {
      setIsOpen(true);
      setIsMinimized(false);

      // Xóa aiQuery khỏi URL để tránh trigger lại khi reload
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('aiQuery');
      setSearchParams(newParams, { replace: true });

      // Trigger gửi tin nhắn
      handleSend(aiQuery);
    }
  }, [searchParams, setSearchParams]);

  // Lắng nghe sự kiện custom 'inject-ai-message'
  useEffect(() => {
    const handleInjectedMessage = (event) => {
      const { query, reply } = event.detail;
      if (!query) return;

      setIsOpen(true);
      setIsMinimized(false);

      // Gọi handleSend để chatbot tự động gửi câu hỏi và nhận câu trả lời
      setTimeout(() => {
        handleSend(query);
      }, 300);
    };

    window.addEventListener('inject-ai-message', handleInjectedMessage);
    return () => {
      window.removeEventListener('inject-ai-message', handleInjectedMessage);
    };
  }, [messages]);

  // Auto-scroll xuống cuối
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus vào input khi mở chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, isMinimized]);

  // -------------------------------------------------------
  // GỬI TIN NHẮN
  // -------------------------------------------------------
  const handleSend = async (customMessage) => {
    const msgText = customMessage || input.trim();
    if (!msgText) return;

    const userMsg = { role: 'user', content: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/ai/chat', {
        message: userMsg.content,
        history: messages.slice(-7) // Chỉ gửi 7 tin gần nhất (Ý tưởng 4)
      }, { timeout: 60000 }); // Tăng timeout lên 60s cho request AI

      if (response.success) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.reply,
          sources: response.sources,
          followups: response.followups
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Xin lỗi, em đang gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé ạ! '
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Oops! Em bị lỗi rồi. Bạn thử gửi lại tin nhắn nhé ạ! '
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // -------------------------------------------------------
  // XÓA LỊCH SỬ CHAT
  // -------------------------------------------------------
  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem(getStorageKey(user?.user_id));
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  if (isAuthenticated && user?.role !== 'TENANT') {
    return null;
  }

  return (
    <div className="ai-chat-widget">
      {isOpen ? (
        <div className="ai-chat-window" style={isMinimized ? { height: 'auto' } : {}}>
          {/* HEADER */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-avatar">
                <RentalWiseIcon size={24} />
              </div>
              <div className="ai-chat-header-text">
                <h4>RentWise AI</h4>
                <p>{isTyping ? '💬 Đang trả lời...' : '🟢 Trực tuyến'}</p>
              </div>
            </div>
            <div className="ai-chat-header-actions">
              <button
                onClick={handleReset}
                className="ai-header-btn"
                title="Xóa lịch sử chat"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="ai-header-btn"
                title={isMinimized ? 'Mở rộng' : 'Thu nhỏ'}
              >
                <Minus size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="ai-header-btn"
                title="Đóng"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          {!isMinimized && (
            <>
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

              {/* QUICK REPLIES - Chỉ hiện khi mới bắt đầu hoặc hiển thị follow-up từ câu trả lời trước */}
              {messages.length <= 1 ? (
                <div className="ai-quick-replies">
                  {QUICK_REPLIES.map((qr, idx) => (
                    <button
                      key={idx}
                      className="ai-quick-reply-btn"
                      onClick={() => handleSend(qr)}
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              ) : (
                (() => {
                  const lastMsg = messages[messages.length - 1];
                  if (lastMsg && lastMsg.role === 'assistant' && lastMsg.followups && lastMsg.followups.length > 0) {
                    return (
                      <div className="ai-quick-replies">
                        {lastMsg.followups.map((q, idx) => (
                          <button
                            key={idx}
                            className="ai-quick-reply-btn text-primary"
                            onClick={() => handleSend(q)}
                            style={{ height: 'auto', whiteSpace: 'normal', textAlign: 'left' }}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()
              )}

              {/* INPUT */}
              <div className="ai-chat-input">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={isTyping}
                />
                <button
                  className="ai-send-btn"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button className="ai-chat-toggle" onClick={() => setIsOpen(true)} title="Chat với AI">
          <RentalWiseIcon size={32} />
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;
