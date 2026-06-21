import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, MapPin, BedDouble, Bath, Square, User } from 'lucide-react';
import './SearchPage.css'; // Reuse styles

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/listings');
        if (response.data.success) {
          setListings(response.data.data);
        }
      } catch (err) {
        setError('Failed to load listings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading listings...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="search-page pt-20">
      <div className="container">
        <div className="results-header mb-6">
          <h2 className="text-2xl font-bold">Available Listings</h2>
          <p className="text-gray-500">Showing {listings.length} results</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((room) => (
            <div 
              key={room.roomId} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col"
              onClick={() => navigate(`/listings/${room.roomId}`)}
            >
              <div className="h-48 overflow-hidden relative">
                {room.thumbnailUrl ? (
                  <img 
                    src={(room.thumbnailUrl && room.thumbnailUrl.startsWith('http') ? room.thumbnailUrl : `http://localhost:5000${room.thumbnailUrl}`)} 
                    alt={room.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60'; }}
                  />
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60" 
                    alt="Placeholder"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-sm font-bold text-primary">
                  ${room.pricePerMonth}/mo
                </div>
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{room.title}</h3>
                </div>
                
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <MapPin size={14} className="mr-1" />
                  <span className="line-clamp-1">{room.address}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {room.landlord?.avatar ? (
                      <img src={room.landlord.avatar} alt="Host" className="w-6 h-6 rounded-full" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={12} className="text-gray-500" />
                      </div>
                    )}
                    <span className="text-xs text-gray-600 font-medium">
                      {room.landlord?.full_name || 'Landlord'}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-primary hover:underline">
                    View Details
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {listings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No active listings available right now.
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;
