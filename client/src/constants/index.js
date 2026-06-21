// ========================================
// Route Constants
// ========================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',
  RESET_PASSWORD: '/reset-password',
  ROOMS: '/rooms',
  ROOM_DETAIL: '/rooms/:id',
  TERMS: '/terms',
  VERIFICATION: '/verification',
  SEARCH: '/search',
  TENANT: {
    DASHBOARD: '/tenant/dashboard',
    PROFILE: '/profile',
    FAVORITES: '/favorites',
    DEPOSIT_HISTORY: '/deposit-history',
    RENTAL_REQUEST: '/rental-request',
    PAYMENT: '/payment',
    CHAT: '/chat',
    CHAT_LANDLORD: '/messages',
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings',
  },

  LANDLORD: {
    DASHBOARD: '/landlord/dashboard',
    DEPOSITS: '/landlord/deposits',
    LISTINGS: '/landlord/listings',
    NEW_LISTING: '/landlord/listings/new',
    REQUESTS: '/landlord/requests',
    USERS: '/landlord/users',
    ANALYTICS: '/landlord/analytics',
    SETTINGS: '/landlord/settings',
    HELP: '/landlord/help',
    CONTACT_SUPPORT: '/landlord/contact-support',
    TERMS: '/landlord/terms',
    PROFILE: '/landlord/profile',
    NOTIFICATIONS: '/landlord/notifications',
    MANAGE_ROOMS: '/landlord/rooms',
    MESSAGES: '/landlord/messages',
    PAYMENTS: '/landlord/payments',
    CONTRACTS: '/landlord/contracts',
    COMPLAINTS: '/landlord/complaints',
    SCHEDULES: '/landlord/schedules',
  },

  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    LISTINGS: '/admin/listings',
    MODERATION: '/admin/moderation',
    ANALYTICS: '/admin/analytics',
    LOGS: '/admin/logs',
    TRANSACTIONS: '/admin/transactions',
    SETTINGS: '/admin/settings',
    HELP: '/admin/help',
    NOTIFICATIONS: '/admin/notifications',
    MESSAGES: '/admin/messages',
    PAYOUTS: '/admin/payouts',
  },

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
