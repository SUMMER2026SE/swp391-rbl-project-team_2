import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import RoomCard from '../components/RoomCard';
import { favoriteService } from '../services/favoriteService';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = await favoriteService.getFavorites();
        // The API returns an array of Favorite objects which contain the Room object
        // Map it to match RoomCard expected structure if necessary
        const mappedFavorites = (data.data || data).map(fav => {
          const room = fav.room;
          return {
            id: room.room_id,
            title: room.title,
            price: room.price_per_month,
            location: [room.address, room.district, room.city].filter(Boolean).join(', '),
            specs: [
              { icon: 'bed', text: `${room.bedrooms || 1} ${t('roomDetail.bed', 'Bed')}` },
              { icon: 'square', text: `${room.area_sqm || 0} m²` }
            ],
            imageTags: room.status === 'available' ? [{ text: t('roomDetail.statusAvailable', 'Available'), type: 'primary' }] : [],
            isFavorite: true,
            image: room.thumbnail_url ? (room.thumbnail_url && room.thumbnail_url.startsWith('http') ? room.thumbnail_url : `http://localhost:5000${room.thumbnail_url}`) : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600'
          };
        });
        setFavorites(mappedFavorites);
      } catch (err) {
        console.error(err);
        setFavorites([]); // Empty state on error
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) return <div className="p-8 text-center">{t('favorites.loading', 'Loading favorites...')}</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="favorites-page container">
      <div className="favorites-header">
        <h1>{t('favorites.title', 'Your Favorites')}</h1>
        <p>{t('favorites.subtitle', "Rooms you've saved for later consideration.")}</p>
      </div>

      <div className="favorites-grid">
        {favorites.length > 0 ? (
          favorites.map(room => (
            <RoomCard
              key={room.id}
              room={room}
              variant="favorite"
              onFavoriteToggle={(id, status) => {
                if (!status) {
                  setFavorites(prev => prev.filter(f => f.id !== id));
                }
              }}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <Heart size={40} />
            </div>
            <h3>{t('favorites.noFavorites', 'No favorites yet')}</h3>
            <p>
              {t('favorites.noFavoritesDesc', "You haven't saved any rooms yet. Browse our available rooms and save your favorites to review later.")}
            </p>
            <Button onClick={() => { navigate('/rooms'); }} className="btn-browse">
              {t('favorites.browseRooms', 'Browse Rooms')}
            </Button>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default FavoritesPage;
