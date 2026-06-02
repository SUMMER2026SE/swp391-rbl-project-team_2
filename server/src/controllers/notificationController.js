const { Op } = require('sequelize');
const { Notification } = require('../models');

// =========================================================
// GET /api/landlord/notifications
// Get all notifications for user
// =========================================================
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { isRead, page = 1, limit = 20 } = req.query;

    const where = { user_id: userId };
    if (isRead !== undefined) {
      where.is_read = isRead === 'true';
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Notification.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      data: rows.map(notif => ({
        notificationId: notif.notification_id,
        title: notif.title,
        message: notif.message,
        notificationType: notif.notification_type,
        relatedId: notif.related_id,
        isRead: notif.is_read,
        readAt: notif.read_at,
        createdAt: notif.created_at,
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
// GET /api/landlord/notifications/unread/count
// Get unread notification count
// =========================================================
const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const count = await Notification.count({
      where: { user_id: userId, is_read: false },
    });

    return res.status(200).json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/notifications/:notificationId/read
// Mark notification as read
// =========================================================
const markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      where: { notification_id: notificationId, user_id: userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// PUT /api/landlord/notifications/read-all
// Mark all notifications as read
// =========================================================
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Notification.update(
      { is_read: true, read_at: new Date() },
      { where: { user_id: userId, is_read: false } }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE /api/landlord/notifications/:notificationId
// Delete notification
// =========================================================
const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({
      where: { notification_id: notificationId, user_id: userId },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    await notification.destroy();

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// =========================================================
// DELETE /api/landlord/notifications/delete-all
// Delete all notifications
// =========================================================
const deleteAllNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Notification.destroy({
      where: { user_id: userId },
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
};
