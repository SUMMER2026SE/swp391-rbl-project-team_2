// ========================================
// Route Constants
// ========================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  ROOMS: '/rooms',
  ROOM_DETAIL: '/rooms/:id',
  TERMS: '/terms',
  VERIFICATION: '/verification',
  TENANT: {
    PROFILE: '/profile',
    FAVORITES: '/favorites',
    DEPOSIT_HISTORY: '/deposit-history',
    RENTAL_REQUEST: '/rental-request',
    PAYMENT: '/payment',
    CHAT: '/chat',
    CHAT_LANDLORD: '/messages',
    NOTIFICATIONS: '/notifications',
  },

  LANDLORD: {
    DASHBOARD: '/landlord',
    DEPOSITS: '/landlord/deposits',
    LISTINGS: '/landlord/listings',
    NEW_LISTING: '/landlord/listings/new',
    REQUESTS: '/landlord/requests',
    USERS: '/landlord/users',
    ANALYTICS: '/landlord/analytics',
    SETTINGS: '/landlord/settings',
    HELP: '/landlord/help',
    CONTACT_SUPPORT: '/landlord/contact-support',
    PROFILE: '/landlord/profile',
    NOTIFICATIONS: '/landlord/notifications',
    MANAGE_ROOMS: '/landlord/rooms',
    MESSAGES: '/landlord/messages',
  },

  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    LISTINGS: '/admin/listings',
    MODERATION: '/admin/moderation',
    ANALYTICS: '/admin/analytics',
    TRANSACTIONS: '/admin/transactions',
    SETTINGS: '/admin/settings',
    HELP: '/admin/help',
    NOTIFICATIONS: '/admin/notifications',
    MESSAGES: '/admin/messages',
  },

  TERMS: '/terms',
  PRIVACY: '/privacy',
  HELP: '/help',
  WELCOME: '/welcome',
};

// ========================================
// Role Constants
// ========================================

export const ROLES = {
  TENANT: 'TENANT',
  LANDLORD: 'LANDLORD',
  ADMIN: 'ADMIN',
};

// ========================================
// Status Constants
// ========================================

export const RENTAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

export const DEPOSIT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
};

export const LISTING_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING_REVIEW: 'PENDING_REVIEW',
};
