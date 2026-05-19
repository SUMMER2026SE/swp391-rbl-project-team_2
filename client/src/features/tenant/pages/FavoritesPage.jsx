import React from 'react';
import Button from '../../../components/common/Button';
import RoomCard from '../components/RoomCard';
import './FavoritesPage.css';

const FAVORITE_ROOMS = [
  {
    id: 1,
    title: 'The Urban Loft',
    price: 1200,
    location: 'Downtown District',
    specs: [
      { icon: 'bed', text: '1 Bed' },
      { icon: 'bath', text: '1 Bath' },
      { icon: 'square', text: '450 sqft' }
    ],
    imageTags: [
      { text: 'Smart Lock', type: 'primary' },
      { text: 'Wi-Fi', type: 'secondary' }
    ],
    isFavorite: true,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 2,
    title: 'Sunny Studio Retreat',
    price: 1450,
    location: 'Arts District',
    specs: [
      { icon: 'bed', text: 'Studio' },
      { icon: 'bath', text: '1 Bath' },
      { icon: 'square', text: '520 sqft' }
    ],
    imageTags: [
      { text: 'Pet Friendly', type: 'primary' }
    ],
    isFavorite: true,
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 3,
    title: 'Executive Suite',
    price: 2100,
    location: 'Financial Center',
    specs: [
      { icon: 'bed', text: '2 Bed' },
      { icon: 'bath', text: '2 Bath' },
      { icon: 'square', text: '850 sqft' }
    ],
    imageTags: [
      { text: 'Gym Access', type: 'primary' },
      { text: 'Parking', type: 'secondary' }
    ],
    isFavorite: true,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=600'
  }
];

const FavoritesPage = () => {
  return (
    <div className="favorites-page container">
      <div className="favorites-header">
        <h1>Your Favorites</h1>
        <p>Rooms you've saved for later consideration.</p>
      </div>

      <div className="favorites-grid">
        {FAVORITE_ROOMS.map(room => (
          <RoomCard key={room.id} room={room} variant="favorite" />
        ))}
      </div>

      <div className="favorites-footer">
        <Button variant="outline" size="lg">Load More</Button>
      </div>
    </div>
  );
};

export default FavoritesPage;
