import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Plus,
  Layers,
  DoorOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  PieChart,
  Copy,
  DollarSign,
  Wrench,
} from 'lucide-react';
import { ROUTES } from '../../../constants';
import { landlordService } from '../services/landlordService';
import toast from 'react-hot-toast';
import './PropertyDashboardPage.css';

const PropertyDashboardPage = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateForm, setDuplicateForm] = useState({
    sourceRoomId: null,
    count: 1,
    targetFloor: 1,
  });

  useEffect(() => {
    fetchDashboard();
  }, [propertyId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await landlordService.getPropertyDashboard(propertyId);
      setData(response?.data || null);
    } catch (error) {
      console.error('Error fetching property dashboard:', error);
      toast.error('Failed to load property dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateRoom = (room) => {
    setDuplicateForm({
      sourceRoomId: room.roomId,
      count: 1,
      targetFloor: room.floor || 1,
      roomNumbers: '',
    });
    setShowDuplicateModal(true);
  };

  const handleConfirmDuplicate = async () => {
    try {
      const customRooms = duplicateForm.roomNumbers
        ? duplicateForm.roomNumbers.split(',').map(n => n.trim()).filter(Boolean)
        : [];
        
      const payload = {
        sourceRoomId: duplicateForm.sourceRoomId,
        targetFloor: duplicateForm.targetFloor,
      };

      if (customRooms.length > 0) {
        payload.roomNumbers = customRooms;
      } else {
        payload.count = duplicateForm.count;
      }

      await landlordService.duplicateRoom(propertyId, payload);
      const duplicatedCount = customRooms.length > 0 ? customRooms.length : duplicateForm.count;
      toast.success(`${duplicatedCount} room(s) duplicated successfully!`);
      setShowDuplicateModal(false);
      fetchDashboard();
    } catch (error) {
      toast.error('Failed to duplicate room');
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0đ';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M đ`;
    }
    return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
  };

  if (loading) {
    return (
      <div className="property-dashboard">
        <div className="properties-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="property-dashboard">
        <p>Property not found.</p>
      </div>
    );
  }

  const { property, stats, floorPlan, revenueChart } = data;
  const maxRevenue = revenueChart ? Math.max(...revenueChart.map(r => r.revenue), 1) : 1;

  // Sort floors descending (top floor first)
  const floorKeys = Object.keys(floorPlan || {}).map(Number).sort((a, b) => b - a);

  return (
    <div className="property-dashboard" id="property-dashboard-page">
      {/* Header */}
      <div className="property-dashboard-header">
        <div className="property-header-info">
          <button className="property-header-back" onClick={() => navigate(ROUTES.LANDLORD.PROPERTIES)}>
            <ArrowLeft size={16} />
            Back to Properties
          </button>
          <h1>{property.name}</h1>
          <div className="property-header-address">
            <MapPin size={14} />
            <span>
              {property.address}
              {property.district && `, ${property.district}`}
              {property.city && `, ${property.city}`}
            </span>
          </div>
        </div>
        <div className="property-header-actions">
          <button
            className="btn-add-room"
            onClick={() => navigate(`${ROUTES.LANDLORD.NEW_LISTING}?propertyId=${propertyId}&floor=1`)}
          >
            <Plus size={16} />
            Add Room
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="property-stats-grid">
        <div className="property-stat-card">
          <div className="property-stat-icon rooms">
            <Layers size={22} />
          </div>
          <div className="property-stat-info">
            <h3>{stats.totalRooms}</h3>
            <span>Total Rooms</span>
          </div>
        </div>
        <div className="property-stat-card">
          <div className="property-stat-icon available">
            <DoorOpen size={22} />
          </div>
          <div className="property-stat-info">
            <h3>{stats.availableRooms}</h3>
            <span>Available</span>
          </div>
        </div>
        <div className="property-stat-card">
          <div className="property-stat-icon rented">
            <CheckCircle2 size={22} />
          </div>
          <div className="property-stat-info">
            <h3>{stats.rentedRooms}</h3>
            <span>Rented</span>
          </div>
        </div>
        <div className="property-stat-card">
          <div className="property-stat-icon occupancy">
            <PieChart size={22} />
          </div>
          <div className="property-stat-info">
            <h3>{stats.occupancyRate}%</h3>
            <span>Occupancy</span>
          </div>
        </div>
        <div className="property-stat-card">
          <div className="property-stat-icon revenue">
            <TrendingUp size={22} />
          </div>
          <div className="property-stat-info">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <span>Total Revenue</span>
          </div>
        </div>
        <div className="property-stat-card">
          <div className="property-stat-icon active-contracts">
            <FileText size={22} />
          </div>
          <div className="property-stat-info">
            <h3>{stats.activeContracts}</h3>
            <span>Active Contracts</span>
          </div>
        </div>
      </div>

      {/* Floor Plan */}
      <div className="floor-plan-section">
        <h2 className="floor-plan-title">
          <Building2 size={20} />
          Floor Plan — Room Status
        </h2>

        <div className="floor-plan-legend">
          <div className="legend-item">
            <div className="legend-dot available" />
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot rented" />
            <span>Rented</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot pending" />
            <span>Pending</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot maintenance" />
            <span>Maintenance</span>
          </div>
        </div>

        {floorKeys.length === 0 ? (
          <div className="floor-plan-empty">
            <Layers size={48} />
            <p>No rooms added yet. Add your first room to see the floor plan!</p>
            <button
              className="btn-add-room"
              onClick={() => navigate(`${ROUTES.LANDLORD.NEW_LISTING}?propertyId=${propertyId}&floor=1`)}
            >
              <Plus size={16} />
              Add First Room
            </button>
          </div>
        ) : (
          floorKeys.map(floor => (
            <div className="floor-group" key={floor}>
              <div className="floor-label">
                <Layers size={16} />
                Floor {floor}
                <span className="floor-count">{floorPlan[floor].length} rooms</span>
              </div>
              <div className="floor-rooms-grid">
                {floorPlan[floor].map(room => (
                  <div
                    className={`floor-room-card ${room.status}`}
                    key={room.roomId}
                    onClick={() => handleDuplicateRoom(room)}
                    title="Click to duplicate this room"
                  >
                    <div className="room-card-header">
                      <span className="room-card-number">
                        {room.roomNumber || `#${room.roomId}`}
                      </span>
                      <span className={`room-card-status-badge ${room.status}`}>
                        {room.status === 'available' && 'Available'}
                        {room.status === 'rented' && 'Rented'}
                        {room.status === 'pending' && 'Pending'}
                        {room.status === 'maintenance' && 'Repair'}
                        {room.status === 'inactive' && 'Inactive'}
                      </span>
                    </div>
                    <div className="room-card-price">
                      {formatPrice(room.pricePerMonth)}đ/mo
                    </div>
                    <div className="room-card-area">
                      {room.areaSqm ? `${room.areaSqm} m²` : '—'}
                      {room.maxOccupants ? ` · ${room.maxOccupants} people` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Revenue Chart */}
      {revenueChart && revenueChart.length > 0 && (
        <div className="revenue-chart-section">
          <h2 className="revenue-chart-title">
            <TrendingUp size={20} />
            Revenue — This Property Only
          </h2>
          <div className="revenue-chart-bars">
            {revenueChart.map((item, idx) => (
              <div className="revenue-bar-col" key={idx}>
                <span className="revenue-bar-value">
                  {item.revenue > 0 ? formatCurrency(item.revenue) : ''}
                </span>
                <div
                  className="revenue-bar"
                  style={{ height: `${Math.max((item.revenue / maxRevenue) * 160, 4)}px` }}
                />
                <span className="revenue-bar-label">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Duplicate Room Modal */}
      {showDuplicateModal && (
        <div className="duplicate-modal-overlay" onClick={() => setShowDuplicateModal(false)}>
          <div className="duplicate-modal" onClick={e => e.stopPropagation()}>
            <h3>
              <Copy size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Duplicate Room
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Create copies of this room with the same specifications and amenities.
            </p>
            <div className="duplicate-modal-field">
              <label>Target Room Numbers (Optional)</label>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '-4px', marginBottom: '8px' }}>
                Comma separated (e.g. 203, 205). If provided, exact room numbers are used.
              </p>
              <input
                type="text"
                placeholder="e.g. 203, 205"
                value={duplicateForm.roomNumbers}
                onChange={e => setDuplicateForm(prev => ({ ...prev, roomNumbers: e.target.value }))}
              />
            </div>
            <div className="duplicate-modal-field">
              <label>Number of copies {duplicateForm.roomNumbers ? '(Disabled)' : ''}</label>
              <input
                type="number"
                min="1"
                max="20"
                value={duplicateForm.count}
                onChange={e => setDuplicateForm(prev => ({ ...prev, count: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                onBlur={e => {
                  if (e.target.value === '' || parseInt(e.target.value) < 1) {
                    setDuplicateForm(prev => ({ ...prev, count: 1 }));
                  }
                }}
                disabled={!!duplicateForm.roomNumbers}
                style={duplicateForm.roomNumbers ? { backgroundColor: '#f1f5f9', color: '#94a3b8' } : {}}
              />
            </div>
            <div className="duplicate-modal-field">
              <label>Target Floor</label>
              <input
                type="number"
                min="1"
                max={property.totalFloors || 10}
                value={duplicateForm.targetFloor}
                onChange={e => setDuplicateForm(prev => ({ ...prev, targetFloor: e.target.value === '' ? '' : parseInt(e.target.value) }))}
                onBlur={e => {
                  if (e.target.value === '' || parseInt(e.target.value) < 1) {
                    setDuplicateForm(prev => ({ ...prev, targetFloor: 1 }));
                  }
                }}
              />
            </div>
            <div className="duplicate-modal-actions">
              <button className="btn-duplicate-cancel" onClick={() => setShowDuplicateModal(false)}>
                Cancel
              </button>
              <button className="btn-duplicate-confirm" onClick={handleConfirmDuplicate}>
                Duplicate {duplicateForm.roomNumbers ? (duplicateForm.roomNumbers.split(',').filter(n => n.trim()).length || 0) : duplicateForm.count} Room(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDashboardPage;
