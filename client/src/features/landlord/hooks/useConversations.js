import { useState, useEffect, useCallback } from 'react';
import { landlordService } from '../services/landlordService';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  autoConnect: false
});

export const useConversations = (params = {}) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const paramsString = JSON.stringify(params);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await landlordService.getConversations(JSON.parse(paramsString));
      // response is { success, data: [...], pagination } from httpClient interceptor
      const convData = response?.data || response || [];
      setConversations(Array.isArray(convData) ? convData : []);
      if (response?.pagination) {
        setPagination(response.pagination);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [paramsString]);

  const fetchConversationById = useCallback(async (id) => {
    try {
      setLoading(true);
      const response = await landlordService.getConversationById(id);
      // response is { success, data: { conversationId, messages, ... } }
      const convData = response?.data || response;
      setCurrentConversation(convData);
      setError(null);
      return convData;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Socket connection & listeners
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleReceiveMessage = (message) => {
      // If we're currently viewing this conversation, add it to the messages
      setCurrentConversation(prev => {
        if (prev && (prev.conversationId == message.conversationId || prev.id == message.conversationId)) {
          // Avoid duplicate messages
          if (prev.messages?.find(m => m.messageId == message.messageId)) return prev;
          
          return {
            ...prev,
            messages: [...(prev.messages || []), message],
          };
        }
        return prev;
      });

      // Update conversations list latest message
      setConversations(prev => prev.map(conv => {
        if (conv.conversation_id == message.conversationId || conv.conversationId == message.conversationId) {
          return {
            ...conv,
            lastMessage: message.content,
            lastMessageAt: message.createdAt
          };
        }
        return conv;
      }));
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);

  // Join socket room when current conversation changes
  useEffect(() => {
    const convId = currentConversation?.conversationId || currentConversation?.id;
    if (convId) {
      const roomStr = convId.toString();
      socket.emit('join_conversation', roomStr);
      return () => {
        socket.emit('leave_conversation', roomStr);
      };
    }
  }, [currentConversation?.conversationId, currentConversation?.id]);

  const sendMessage = async (conversationId, content) => {
    try {
      const response = await landlordService.sendMessage(conversationId, content);
      const message = response?.data || response;
      if (currentConversation && (currentConversation.conversationId == conversationId || currentConversation.id == conversationId)) {
        setCurrentConversation(prev => {
          if (prev.messages?.find(m => m.messageId == message.messageId)) return prev;
          return {
            ...prev,
            messages: [...(prev.messages || []), message],
          };
        });
      }
      return message;
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  return {
    conversations,
    currentConversation,
    loading,
    error,
    pagination,
    fetchConversations,
    fetchConversationById,
    sendMessage,
  };
};

export default useConversations;
