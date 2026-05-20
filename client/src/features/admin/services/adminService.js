import httpClient from '../../../services/httpClient';

export const adminService = {
  getStats: () => httpClient.get('/admin/stats'),
  getListings: (params) => httpClient.get('/admin/listings', { params }),
  updateListing: (id, data) => httpClient.put(`/admin/listings/${id}`, data),
  getTransactions: (params) => httpClient.get('/admin/transactions', { params }),
  getUsers: (params) => httpClient.get('/admin/users', { params }),
  updateUser: (id, data) => httpClient.put(`/admin/users/${id}`, data),
};
