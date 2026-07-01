import httpClient from '../../../services/httpClient';

export const roomService = {
  getRooms: async (params) => {
    const response = await httpClient.get('/listings', { params });
    return response;
  },
  getRoomById: async (id) => {
    const response = await httpClient.get(`/listings/${id}`);
    return response;
  },
  searchRooms: async (params) => {
    const response = await httpClient.get('/listings/search', { params });
    return response;
  },
  searchProperties: async (params) => {
    const response = await httpClient.get('/listings/properties/search', { params });
    return response;
  },
  getPropertyById: async (id) => {
    const response = await httpClient.get(`/listings/properties/${id}`);
    return response;
  }
};
