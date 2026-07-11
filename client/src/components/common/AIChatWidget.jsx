import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Sparkles, RotateCcw, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuthStore from '../../store/useAuthStore';
import './AIChatWidget.css';

// =========================================================
// CONSTANTS
// =========================================================
const STORAGE_KEY = 'ai-chat-history';
const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'Xin chào! 👋 Em là trợ lý ảo RentalWise. Em có thể giúp bạn tìm phòng trọ, giải đáp thắc mắc về chính sách thuê phòng, hoặc tư vấn lựa chọn phòng phù hợp nhé ạ! 😊'
};

const QUICK_REPLIES = [
  '🏠 Có phòng nào trống không?',
  '💰 Phòng giá dưới 3 triệu?',
  '📋 Quy trình thuê phòng?',
  '🔑 Chính sách đặt cọc?',
];

// =========================================================
// MESSAGE CONTENT RENDERER (with clickable links)
// =========================================================
const MessageContent = ({ content }) => {
  const navigate = useNavigate();
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
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

// =========================================================
// MAIN COMPONENT
// =========================================================
const AIChatWidget = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(() => {
    // Khôi phục lịch sử từ localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { /* ignore */ }
    return [WELCOME_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Lưu lịch sử chat vào localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
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
      });

      if (response.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Xin lỗi, em đang gặp sự cố kết nối. Bạn vui lòng thử lại sau nhé ạ! 🙏'
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Oops! Em bị lỗi rồi. Bạn thử gửi lại tin nhắn nhé ạ! 😅'
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
    localStorage.removeItem(STORAGE_KEY);
  };

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  if (!isAuthenticated || user?.role !== 'TENANT') {
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
                <Sparkles size={20} />
              </div>
              <div className="ai-chat-header-text">
                <h4>RentalWise AI</h4>
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

              {/* QUICK REPLIES - Chỉ hiện khi mới bắt đầu */}
              {messages.length <= 1 && (
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
          <MessageSquare size={26} />
        </button>
      )}
    </div>
  );
};

export default AIChatWidget;
