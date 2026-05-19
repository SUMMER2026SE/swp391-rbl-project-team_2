import React from 'react';
import { Star, MapPin, Heart, BedDouble, Bath, Maximize } from 'lucide-react';
import { clsx } from 'clsx';
import './RoomCard.css';

const RoomCard = ({ room, variant = 'standard' }) => {
  const { title, price, rating, location, distance, tags = [], imageTags = [], specs = [], isFavorite, image } = room;

  return (
    <div className={clsx("room-card", `room-card-${variant}`)}>
      <div className="room-card-image-wrapper">
        <img src={image} alt={title} className="room-card-image" />
        
        {/* Floating tags on the image (For Favorite/Chat variant) */}
        {(variant === 'favorite' || variant === 'chat') && imageTags.length > 0 && (
          <div className="room-card-image-tags">
            {imageTags.map((tag, idx) => (
              <span key={idx} className={clsx(
                "image-tag", 
                tag.type === 'primary' && 'primary-tag',
                tag.type === 'match' && 'match-tag',
                (!tag.type || tag.type === 'secondary') && 'secondary-tag'
              )}>
                {tag.text}
              </span>
            ))}
          </div>
        )}

        {/* Floating price for chat and standard variants */}
        {(variant === 'chat' || variant === 'standard') && (
          <div className="chat-floating-price">
            ${price.toLocaleString()}/mo
          </div>
        )}

        {variant !== 'chat' && (
          <button className="favorite-btn">
            <Heart size={18} className={clsx('heart-icon', isFavorite && 'filled')} />
          </button>
        )}
      </div>
      
      <div className="room-card-content">
        {variant === 'standard' ? (
          // STANDARD LAYOUT
          <>
            <div className="room-card-header">
              <h3 className="room-card-title">{title}</h3>
              {rating && (
                <div className="room-card-rating">
                  <Star size={14} className="star-icon" />
                  <span>{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="room-card-location">
              <MapPin size={14} />
              <span>{location} {distance ? `• ${distance}` : ''}</span>
            </div>
            <div className="room-card-tags">
              {tags.map((tag, index) => (
                <span key={index} className="room-card-tag">{tag}</span>
              ))}
            </div>
          </>
        ) : variant === 'favorite' ? (
          // FAVORITE LAYOUT
          <>
            <div className="room-card-header favorite-header">
              <h3 className="room-card-title">{title}</h3>
              <p className="room-card-price">
                <span>${price}</span><span className="price-period">/mo</span>
              </p>
            </div>
            <div className="room-card-location">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
            
            <hr className="room-card-divider" />
            
            <div className="room-card-specs">
              {specs.map((spec, index) => (
                <div key={index} className="spec-item">
                  {spec.icon === 'bed' && <BedDouble size={14} />}
                  {spec.icon === 'bath' && <Bath size={14} />}
                  {spec.icon === 'square' && <Maximize size={14} />}
                  <span>{spec.text}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          // CHAT LAYOUT
          <>
            <div className="room-card-header chat-header">
              <h3 className="room-card-title">{title}</h3>
            </div>
            <div className="room-card-location">
              <MapPin size={14} />
              <span>{location}</span>
            </div>
            <div className="room-card-tags chat-tags">
              {tags.map((tag, index) => (
                <span key={index} className="room-card-tag chat-tag">{tag}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
