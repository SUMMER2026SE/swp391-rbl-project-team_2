const { Op } = require('sequelize');
const { Conversation, Message, User, Notification } = require('../models');

// =========================================================
// POST /api/landlord/conversations
// Create or get conversation
// =========================================================
const createOrGetConversation = async (req, res, next) => {
  try {
    const { participantId, roomId } = req.body;
    const userId = req.user.userId;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required.',
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      where: {
        [Op.or]: [
          { participant_1_id: userId, participant_2_id: participantId },
          { participant_1_id: participantId, participant_2_id: userId },
        ],
        ...(roomId && { room_id: roomId }),
      },
    });

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participant_1_id: userId,
        participant_2_id: participantId,
        room_id: roomId || null,
        is_active: true,
      });
    }

    return res.status(200).json({
      success: true,
      message: conversation.created_at ? 'Conversation created successfully!' : 'Conversation retrieved successfully!',
      data: {
        conversationId: conversation.conversation_id,
        participant1Id: conversation.participant_1_id,
        participant2Id: conversation.participant_2_id,
        roomId: conversation.room_id,
        isActive: conversation.is_active,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/conversations
// Get all conversations for user
// =========================================================
const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const { count, rows } = await Conversation.findAndCountAll({
      where: {
        [Op.or]: [
          { participant_1_id: userId },
          { participant_2_id: userId },
        ],
        is_active: true,
      },
      include: [
        { model: User, as: 'participant1', attributes: ['user_id', 'full_name', 'avatar_url'] },
        { model: User, as: 'participant2', attributes: ['user_id', 'full_name', 'avatar_url'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['last_message_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows.map(conv => ({
        conversationId: conv.conversation_id,
        conversation_id: conv.conversation_id,
        participant1Id: conv.participant_1_id,
        participant2Id: conv.participant_2_id,
        participant_1_id: conv.participant_1_id,
        participant_2_id: conv.participant_2_id,
        participant1: conv.participant1,
        participant2: conv.participant2,
        lastMessage: conv.last_message,
        lastMessageAt: conv.last_message_at,
        isActive: conv.is_active,
        createdAt: conv.created_at,
        userId: userId,
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/conversations/:conversationId/messages
// Get messages in conversation
// =========================================================
const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      where: {
        conversation_id: conversationId,
        [Op.or]: [
          { participant_1_id: userId },
          { participant_2_id: userId },
        ],
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
      where: { conversation_id: conversationId },
      include: [
        { model: User, as: 'sender', attributes: ['user_id', 'full_name', 'avatar_url'] },
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    // Mark messages as read
    await Message.update(
      { is_read: true, read_at: new Date() },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: userId },
          is_read: false,
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: rows.reverse().map(msg => ({
        messageId: msg.message_id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        sender_id: msg.sender_id,
        content: msg.content,
        isRead: msg.is_read,
        readAt: msg.read_at,
        sender: msg.sender,
        createdAt: msg.created_at,
        created_at: msg.created_at,
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// POST /api/landlord/conversations/:conversationId/messages
// Send message
// =========================================================
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required.',
      });
    }

    // Verify user is part of conversation
    const conversation = await Conversation.findOne({
      where: {
        conversation_id: conversationId,
        [Op.or]: [
          { participant_1_id: userId },
          { participant_2_id: userId },
        ],
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: userId,
      content: content.trim(),
      is_read: false,
    });

    // Update conversation last message
    conversation.last_message = content.trim();
    conversation.last_message_at = new Date();
    await conversation.save();

    // Get recipient ID
    const recipientId = conversation.participant_1_id === userId ? conversation.participant_2_id : conversation.participant_1_id;

    // Create notification for recipient
    const sender = await User.findOne({ where: { user_id: userId } });
    await Notification.create({
      user_id: recipientId,
      title: 'New Message',
      message: `${sender.full_name} sent you a message`,
      notification_type: 'message',
      related_id: message.message_id,
    });

    const messageData = {
      messageId: message.message_id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      sender_id: message.sender_id,
      content: message.content,
      createdAt: message.created_at,
      created_at: message.created_at,
      sender: sender
    };

    // Broadcast via socket.io if it's attached to app
    const io = req.app.get('io');
    if (io) {
      io.to(conversationId).emit('receive_message', messageData);
      io.to(`user_${recipientId}`).emit('new_message_notification', messageData);
    }

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: messageData,
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/conversations/:conversationId/close
// Close conversation
// =========================================================
const closeConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findOne({
      where: {
        conversation_id: conversationId,
        [Op.or]: [
          { participant_1_id: userId },
          { participant_2_id: userId },
        ],
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    conversation.is_active = false;
    await conversation.save();

    return res.status(200).json({
      success: true,
      message: 'Conversation closed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// GET /api/landlord/conversations/:conversationId
// Get conversation details with messages
// =========================================================
const getConversationDetails = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findOne({
      where: {
        conversation_id: conversationId,
        [Op.or]: [
          { participant_1_id: userId },
          { participant_2_id: userId },
        ],
      },
      include: [
        { model: User, as: 'participant1', attributes: ['user_id', 'full_name', 'avatar_url'] },
        { model: User, as: 'participant2', attributes: ['user_id', 'full_name', 'avatar_url'] },
      ]
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Get all messages in this conversation (sorted oldest to newest for chat area)
    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [
        { model: User, as: 'sender', attributes: ['user_id', 'full_name', 'avatar_url'] },
      ],
      order: [['created_at', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      data: {
        conversationId: conversation.conversation_id,
        id: conversation.conversation_id, // For frontend compatibility
        participant1Id: conversation.participant_1_id,
        participant2Id: conversation.participant_2_id,
        participant1: conversation.participant1,
        participant2: conversation.participant2,
        roomId: conversation.room_id,
        isActive: conversation.is_active,
        createdAt: conversation.created_at,
        userId: userId, // Current user id
        messages: messages.map(msg => ({
          messageId: msg.message_id,
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          sender_id: msg.sender_id, // support snake_case
          content: msg.content,
          isRead: msg.is_read,
          readAt: msg.read_at,
          sender: msg.sender,
          createdAt: msg.created_at,
          created_at: msg.created_at, // support snake_case
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrGetConversation,
  getUserConversations,
  getConversationMessages,
  sendMessage,
  closeConversation,
  getConversationDetails,
};
