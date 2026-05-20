import { useState, useEffect } from 'react';
import { favoriteService } from '../services/favoriteService';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = await favoriteService.getFavorites();
        setFavorites(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const addFavorite = async (roomId) => {
    try {
      const newFavorite = await favoriteService.addFavorite(roomId);
      setFavorites([...favorites, newFavorite]);
      return newFavorite;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeFavorite = async (roomId) => {
    try {
      await favoriteService.removeFavorite(roomId);
      setFavorites(favorites.filter(f => f.roomId !== roomId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const isFavorited = (roomId) => {
    return favorites.some(f => f.roomId === roomId);
  };

  return { favorites, loading, error, addFavorite, removeFavorite, isFavorited };
};

export default useFavorites;
