import { useState, useEffect, useCallback } from 'react';
import { landlordService } from '../services/landlordService';

export const useRooms = (params = {}) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const paramsString = JSON.stringify(params);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const response = await landlordService.getRooms(JSON.parse(paramsString));
      // response is { success, data: [...], pagination } from httpClient
      const roomsData = response?.data || response || [];
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      if (response?.pagination) {
        setPagination(response.pagination);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [paramsString]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const createRoom = async (roomData) => {
    try {
      const newRoom = await landlordService.createRoom(roomData);
      setRooms([newRoom, ...rooms]);
      return newRoom;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateRoom = async (id, roomData) => {
    try {
      const updated = await landlordService.updateRoom(id, roomData);
      setRooms(rooms.map(r => {
        const roomId = r.roomId || r.room_id || r.id;
        if (roomId === id) {
          return {
            ...r,
            ...roomData,
            ...updated,
            title: updated.title || roomData.title || r.title,
            status: updated.status || roomData.status || r.status,
          };
        }
        return r;
      }));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRoom = async (id) => {
    try {
      await landlordService.deleteRoom(id);
      setRooms(rooms.filter(r => {
        const roomId = r.roomId || r.room_id || r.id;
        return roomId !== id;
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const uploadImage = async (roomId, file) => {
    try {
      const result = await landlordService.uploadRoomImage(roomId, file);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteImage = async (roomId, imageId) => {
    try {
      await landlordService.deleteRoomImage(roomId, imageId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const setPrimaryImage = async (roomId, imageId) => {
    try {
      const result = await landlordService.setPrimaryImage(roomId, imageId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    rooms,
    loading,
    error,
    pagination,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    uploadImage,
    deleteImage,
    setPrimaryImage,
  };
};

export default useRooms;
