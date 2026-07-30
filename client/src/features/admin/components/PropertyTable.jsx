import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { EyeOff, CheckCircle, ChevronDown, ChevronRight, Lock, Clock, XCircle, ExternalLink } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';
import './ListingTable.css'; // Reuse ListingTable styles

const PropertyTable = ({ properties, onUpdateStatus, onUpdateRoomStatus }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expandedPropertyIds, setExpandedPropertyIds] = useState([]);

  const toggleExpand = (id) => {
    setExpandedPropertyIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'available':
        return <span className="status-badge status-active">{t('adminListings.statusActive', 'Active')}</span>;
      case 'hidden':
        return <span className="status-badge status-hidden">{t('adminListings.hiddenSystem', 'Hidden')}</span>;
      case 'occupied':
      case 'rented':
        return (
          <span className="status-badge status-occupied">
            <Lock size={12} /> {t('adminListings.statusOccupied', 'Occupied')}
          </span>
        );
      case 'pending':
        return (
          <span className="status-badge" style={{ backgroundColor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
            <Clock size={12} /> {t('adminListings.statusPending', 'Pending')}
          </span>
        );
      case 'rejected':
        return (
          <span className="status-badge" style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3' }}>
            <XCircle size={12} /> {t('adminListings.statusRejected', 'Rejected')}
          </span>
        );
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="listing-table-container">
      <table className="listing-table">
        <thead>
          <tr>
            <th>Căn hộ / Tòa nhà</th>
            <th>Chủ nhà</th>
            <th style={{ textAlign: 'center' }}>Số phòng</th>
            <th>Trạng thái</th>
            <th className="th-actions">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => {
            const isExpanded = expandedPropertyIds.includes(property.rawId);
            return (
              <React.Fragment key={property.id}>
                <tr style={{ cursor: 'pointer' }} onClick={() => toggleExpand(property.rawId)}>
                  <td className="listing-property">
                    <div className="property-info-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}>
                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </span>
                      <img src={property.thumbnailUrl} alt={property.name} className="property-thumbnail" />
                      <div className="property-details">
                        <span className="property-id">{property.id}</span>
                        <span className="property-title">{property.name}</span>
                        <span className="property-location">{property.address}, {property.district}, {property.city}</span>
                      </div>
                    </div>
                  </td>
                  <td className="listing-landlord">
                    <div className="landlord-info-cell">
                      <span className="landlord-name">{property.landlord?.name || 'Không rõ'}</span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{property.landlord?.email}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '600', color: '#4f46e5' }}>
                    {property.roomCount}
                  </td>
                  <td className="listing-status">
                    <div className="status-cell">
                      {getStatusBadge(property.status)}
                    </div>
                  </td>
                  <td className="listing-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="action-buttons">
                      {property.status.toLowerCase() !== 'hidden' ? (
                        <button
                          className="btn-action-icon"
                          title="Ẩn căn hộ"
                          onClick={() => onUpdateStatus(property.rawId, 'hidden')}
                          style={{ color: '#dc2626' }}
                        >
                          <EyeOff size={18} />
                        </button>
                      ) : (
                        <button
                          className="btn-action-icon"
                          title="Kích hoạt căn hộ"
                          onClick={() => onUpdateStatus(property.rawId, 'active')}
                          style={{ color: '#16a34a' }}
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                
                {isExpanded && (
                  <tr>
                    <td colSpan="5" style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ padding: '16px 20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} onClick={(e) => e.stopPropagation()}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#1e293b', fontWeight: '700' }}>
                          Danh sách phòng thuộc căn hộ:
                        </h4>
                        {property.rooms && property.rooms.length > 0 ? (
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
                                <th style={{ padding: '8px 12px' }}>Mã phòng</th>
                                <th style={{ padding: '8px 12px' }}>Tên / Số phòng</th>
                                <th style={{ padding: '8px 12px' }}>Giá thuê</th>
                                <th style={{ padding: '8px 12px' }}>Trạng thái</th>
                                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Thao tác</th>
                              </tr>
                            </thead>
                            <tbody>
                              {property.rooms.map(room => (
                                <tr key={room.roomId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: '8px 12px', color: '#4f46e5', fontWeight: '600' }}>
                                    {`PRP-${room.roomId.toString().padStart(4, '0')}`}
                                  </td>
                                  <td style={{ padding: '8px 12px', fontWeight: '500', color: '#1e293b' }}>
                                    {room.roomNumber ? `Phòng ${room.roomNumber} - ${room.title}` : room.title}
                                  </td>
                                  <td style={{ padding: '8px 12px' }}>
                                    {formatCurrency(room.price)} đ
                                  </td>
                                  <td style={{ padding: '8px 12px' }}>
                                    {getStatusBadge(room.status)}
                                  </td>
                                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                    <button
                                      onClick={() => navigate(`/admin/listings/${room.roomId}/review`, { state: { fromTab: 'properties' } })}
                                      style={{ border: 'none', background: 'none', color: '#4f46e5', cursor: 'pointer', padding: '4px', marginRight: '8px' }}
                                      title="Xem chi tiết"
                                    >
                                      <ExternalLink size={16} />
                                    </button>
                                    {room.status.toLowerCase() !== 'hidden' ? (
                                      <button
                                        onClick={() => onUpdateRoomStatus(room.roomId, 'hidden')}
                                        style={{ border: 'none', background: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                                        title="Ẩn phòng"
                                      >
                                        <EyeOff size={16} />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => onUpdateRoomStatus(room.roomId, 'available')}
                                        style={{ border: 'none', background: 'none', color: '#16a34a', cursor: 'pointer', padding: '4px' }}
                                        title="Hiện phòng"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '8px' }}>
                            Không có phòng nào trong căn hộ này.
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyTable;
