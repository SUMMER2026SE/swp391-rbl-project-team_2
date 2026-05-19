export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  ROOMS: '/rooms',
  ROOM_DETAIL: '/rooms/:id',
  TENANT: {
    PROFILE: '/profile',
    FAVORITES: '/favorites',
    DEPOSIT_HISTORY: '/history',
    MAINTENANCE: '/maintenance',
    PAYMENT: '/payment',
  },
  LANDLORD: {
    DASHBOARD: '/admin',
    DEPOSITS: '/admin/deposits',
    LISTINGS: '/admin/listings',
    NEW_LISTING: '/admin/listings/new',
    REQUESTS: '/admin/requests',
  }
};

export const ROLES = {
  TENANT: 'TENANT',
  LANDLORD: 'LANDLORD',
  ADMIN: 'ADMIN'
};
