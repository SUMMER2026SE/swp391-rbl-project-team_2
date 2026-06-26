import httpClient from '../../../services/httpClient';

export const rentalRequestService = {
  createRequest: async (data) => {
    try {
      const response = await httpClient.post('/tenant/rental-requests', data);
      return response;
    } catch (error) {
      console.error('Error creating rental request:', error);
      throw error;
    }
  },

  getMyRequests: async (params = {}) => {
    try {
      const response = await httpClient.get('/tenant/rental-requests', { params });
      return response;
    } catch (error) {
      console.error('Error fetching rental requests:', error);
      throw error;
    }
  },

  getRequestDetail: async (requestId) => {
    try {
      const response = await httpClient.get(`/tenant/rental-requests/${requestId}`);
      return response;
    } catch (error) {
      console.error('Error fetching request detail:', error);
      throw error;
    }
  },

  cancelRequest: async (requestId, reason) => {
    try {
      const response = await httpClient.put(`/tenant/rental-requests/${requestId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.error('Error canceling request:', error);
      throw error;
    }
  },

  requestViewing: async (data) => {
    try {
      const response = await httpClient.post('/tenant/viewing-schedules', data);
      return response;
    } catch (error) {
      console.error('Error requesting viewing:', error);
      throw error;
    }
  },

  getMyViewingSchedules: async (params = {}) => {
    try {
      const response = await httpClient.get('/tenant/viewing-schedules', { params });
      return response;
    } catch (error) {
      console.error('Error fetching viewing schedules:', error);
      throw error;
    }
  },

  retryPayment: async (scheduleId) => {
    try {
      const response = await httpClient.post(`/tenant/viewing-schedules/${scheduleId}/pay`);
      return response;
    } catch (error) {
      console.error('Error retrying payment:', error);
      throw error;
    }
  },

  requestContract: async (scheduleId, message, startDate, durationMonths, tenantName, tenantIc, tenantIcIssueDate, tenantIcIssuePlace, tenantPermanentAddress) => {
    try {
      const response = await httpClient.post(`/tenant/viewing-schedules/${scheduleId}/request-contract`, { 
        message,
        startDate,
        durationMonths,
        tenantName,
        tenantIc,
        tenantIcIssueDate,
        tenantIcIssuePlace,
        tenantPermanentAddress
      });
      return response;
    } catch (error) {
      console.error('Error requesting contract:', error);
      throw error;
    }
  },

  requestContractForRentalRequest: async (requestId, message, startDate, durationMonths, tenantName, tenantIc, tenantIcIssueDate, tenantIcIssuePlace, tenantPermanentAddress) => {
    try {
      const response = await httpClient.post(`/tenant/rental-requests/${requestId}/request-contract`, { 
        message,
        startDate,
        durationMonths,
        tenantName,
        tenantIc,
        tenantIcIssueDate,
        tenantIcIssuePlace,
        tenantPermanentAddress
      });
      return response;
    } catch (error) {
      console.error('Error requesting contract for rental request:', error);
      throw error;
    }
  },

  disputeViewingSchedule: async (scheduleId, reason) => {
    try {
      const response = await httpClient.post(`/tenant/viewing-schedules/${scheduleId}/dispute`, { reason });
      return response;
    } catch (error) {
      console.error('Error disputing viewing schedule:', error);
      throw error;
    }
  },

  cancelViewingSchedule: async (scheduleId) => {
    try {
      const response = await httpClient.put(`/tenant/viewing-schedules/${scheduleId}/cancel`);
      return response;
    } catch (error) {
      console.error('Error canceling viewing schedule:', error);
      throw error;
    }
  },

  declineViewingSchedule: async (scheduleId) => {
    try {
      const response = await httpClient.put(`/tenant/viewing-schedules/${scheduleId}/decline`);
      return response;
    } catch (error) {
      console.error('Error declining viewing schedule:', error);
      throw error;
    }
  },

  getMyContracts: async () => {
    try {
      const response = await httpClient.get('/tenant/contracts');
      return response;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },

  signContract: async (contractId, data) => {
    try {
      const response = await httpClient.put(`/tenant/contracts/${contractId}/sign`, data);
      return response;
    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  },

  cancelContract: async (contractId) => {
    try {
      const response = await httpClient.put(`/tenant/contracts/${contractId}/cancel`);
      return response;
    } catch (error) {
      console.error('Error cancelling contract:', error);
      throw error;
    }
  },
};
