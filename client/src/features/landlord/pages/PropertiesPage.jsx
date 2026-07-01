import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  MapPin,
  BarChart3,
  Edit3,
  Trash2,
  DollarSign,
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import { landlordService } from '../services/landlordService';
import toast from 'react-hot-toast';
import './PropertiesPage.css';

const PropertiesPage = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await landlordService.getProperties({ limit: 50 });
      setProperties(response?.data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId, propertyName) => {
    if (!window.confirm(`Are you sure you want to delete "${propertyName}" and all its rooms?`)) {
      return;
    }
    try {
      await landlordService.deleteProperty(propertyId);
      toast.success('Property deleted successfully!');
      fetchProperties();
    } catch (error) {
      toast.error('Failed to delete property');
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  if (loading) {
    return (
      <div className="properties-page">
        <div className="properties-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="properties-page" id="properties-page">
      {/* Header */}
      <div className="properties-page-header">
        <div>
          <h1>My Properties</h1>
          <p>Manage your buildings, houses and their rooms</p>
        </div>
        <button
          className="btn-add-property"
          onClick={() => navigate(ROUTES.LANDLORD.NEW_PROPERTY)}
        >
          <Plus size={18} />
          <span>Add New Property</span>
        </button>
      </div>

      {/* Properties Grid or Empty State */}
      {properties.length === 0 ? (
        <div className="properties-empty-state">
          <div className="empty-icon">
            <Building2 size={36} />
          </div>
          <h3>No Properties Yet</h3>
          <p>Create your first property to start managing your rooms by building, floor, and unit.</p>
          <button
            className="btn-add-property"
            onClick={() => navigate(ROUTES.LANDLORD.NEW_PROPERTY)}
          >
            <Plus size={18} />
            <span>Add Your First Property</span>
          </button>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map((property) => {
            const stats = property.stats || {};
            const occupancy = stats.occupancyRate || 0;
            const priceRange = stats.priceRange || { min: 0, max: 0 };

            return (
              <div className="property-card" key={property.propertyId}>
                {/* Thumbnail */}
                <div className="property-card-thumbnail">
                  {property.thumbnailUrl ? (
                    <img 
                      src={property.thumbnailUrl.startsWith('http') ? property.thumbnailUrl : `http://localhost:5000${property.thumbnailUrl}`} 
                      alt={property.name} 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=60'; }}
                    />
                  ) : (
                    <div className="property-icon-placeholder">
                      <Building2 size={48} />
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="property-card-body">
                  <h3 className="property-card-name">{property.name}</h3>
                  <div className="property-card-address">
                    <MapPin size={14} />
                    <span>
                      {property.address}
                      {property.district && `, ${property.district}`}
                      {property.city && `, ${property.city}`}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="property-card-stats">
                    <div className="property-stat-item">
                      <div className="property-stat-value">{stats.totalRooms || 0}</div>
                      <div className="property-stat-label">Total</div>
                    </div>
                    <div className="property-stat-item">
                      <div className="property-stat-value available">{stats.availableRooms || 0}</div>
                      <div className="property-stat-label">Available</div>
                    </div>
                    <div className="property-stat-item">
                      <div className="property-stat-value rented">{stats.rentedRooms || 0}</div>
                      <div className="property-stat-label">Rented</div>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="occupancy-bar-wrapper">
                    <div className="occupancy-bar-header">
                      <span>Occupancy Rate</span>
                      <span>{occupancy}%</span>
                    </div>
                    <div className="occupancy-bar-track">
                      <div
                        className={`occupancy-bar-fill ${occupancy < 30 ? 'low' : occupancy < 70 ? 'medium' : ''}`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                  </div>

                  {/* Price Range */}
                  {priceRange.max > 0 && (
                    <div className="property-card-price">
                      <span style={{ fontWeight: 600, color: '#16a34a' }}>
                        {formatPrice(priceRange.min)} đ
                        {priceRange.min !== priceRange.max && (
                          <> - {formatPrice(priceRange.max)} đ</>
                        )}
                        <span style={{ color: '#64748b', fontWeight: 500 }}> / tháng</span>
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="property-card-actions">
                    <button
                      className="btn-manage-property"
                      onClick={() => navigate(`/landlord/properties/${property.propertyId}/dashboard`)}
                    >
                      <BarChart3 size={16} />
                      <span>Dashboard</span>
                    </button>
                    <button
                      className="btn-edit-property"
                      onClick={() => navigate(`/landlord/properties/${property.propertyId}/dashboard`)}
                      title="Edit Property"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      className="btn-delete-property"
                      onClick={() => handleDelete(property.propertyId, property.name)}
                      title="Delete Property"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PropertiesPage;
