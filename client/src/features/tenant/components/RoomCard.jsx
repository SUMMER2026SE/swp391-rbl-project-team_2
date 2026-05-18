import React from 'react';
import { Star, MapPin, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import './RoomCard.css';

const RoomCard = ({ room }) => {
  const { title, price, rating, location, distance, tags, isFavorite, image } = room;

  return (
    <div className="room-card">
      <div className="room-card-image-wrapper">
        <img src={image} alt={title} className="room-card-image" />
        <button className="favorite-btn">
          <Heart size={20} className={clsx('heart-icon', isFavorite && 'filled')} />
        </button>
      </div>
      <div className="room-card-content">
        <div className="room-card-header">
          <h3 className="room-card-title">{title}</h3>
          <div className="room-card-rating">
            <Star size={14} className="star-icon" />
            <span>{rating}</span>
          </div>
        </div>
        <p className="room-card-price">
          <span>${price}</span>/mo
        </p>
        <div className="room-card-location">
          <MapPin size={14} />
          <span>{location} • {distance}</span>
        </div>
        <div className="room-card-tags">
          {tags.map((tag, index) => (
            <span key={index} className="room-card-tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
