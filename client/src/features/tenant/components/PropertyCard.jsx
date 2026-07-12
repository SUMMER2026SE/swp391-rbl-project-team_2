import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import './RoomCard.css';

const PropertyCard = ({ property }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    id, title, address, district, city, 
    thumbnailUrl, minPrice, maxPrice, 
    totalRooms, availableRooms 
  } = property;

  const handleClick = () => {
    navigate(`/properties/${id}`);
  };

  const formatPrice = (price) => price.toLocaleString('vi-VN');
  const priceDisplay = minPrice === maxPrice 
    ? `${formatPrice(minPrice)} vnđ` 
    : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)} vnđ`;

  return (
    <div className="room-card room-card-standard property-card" onClick={handleClick}>
      <div className="room-card-image-wrapper">
        <img 
          src={thumbnailUrl} 
          alt={title} 
          className="room-card-image" 
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60'; }}
        />
        
        <div className="room-card-image-tags">
          <span className={clsx(
            "image-tag", 
            availableRooms > 0 ? "primary-tag" : "danger-tag"
          )}>
            {availableRooms > 0 ? `${availableRooms} ${t('propertyCard.roomsAvailable', 'phòng trống')}` : t('propertyCard.soldOut', 'Hết phòng')}
          </span>
        </div>

        <div className="chat-floating-price">
          {priceDisplay}/{t('propertyCard.mo', 'mo')}
        </div>
      </div>
      
      <div className="room-card-content">
        <div className="room-card-header">
          <h3 className="room-card-title">{title}</h3>
        </div>
        <div className="room-card-location">
          <MapPin size={14} />
          <span>{address}, {district}, {city}</span>
        </div>
        <div className="room-card-specs" style={{ margin: '0 0 0.75rem 0' }}>
          <div className="spec-item">
            <Building size={14} />
            <span>{t('propertyCard.totalRoomsPrefix', 'Tổng số')} {totalRooms} {t('propertyCard.totalRoomsSuffix', 'phòng')}</span>
          </div>
          <div className="spec-item">
            <Info size={14} />
            <span>{t('propertyCard.clickToView', 'Nhấn để xem các phòng')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
