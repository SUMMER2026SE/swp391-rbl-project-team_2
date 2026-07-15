import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MoreVertical, Eye, Download } from 'lucide-react';
import { ROUTES } from '../../../constants';
import { formatCurrency, formatDateTime, getAvatarUrl } from '../../../utils/format';
import './TransactionTable.css';

const TransactionTable = ({ transactions, onViewInvoice }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return <span className="status-badge status-success">{t('adminTransactions.success')}</span>;
      case 'pending':
        return <span className="status-badge status-pending">{t('adminTransactions.pending')}</span>;
      case 'refunded':
        return <span className="status-badge status-refunded">{t('adminTransactions.refunded')}</span>;
      case 'failed':
        return <span className="status-badge status-failed">{t('adminTransactions.failed')}</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="transaction-table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>{t('adminTransactions.transactionId')}</th>
            <th>{t('adminTransactions.dateTime')}</th>
            <th>{t('adminTransactions.tenant')}</th>
            <th>{t('adminTransactions.property')}</th>
            <th>{t('adminTransactions.type')}</th>
            <th>{t('adminTransactions.amount')}</th>
            <th>{t('adminTransactions.status')}</th>
            <th className="th-actions">{t('adminTransactions.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="tx-id">#{tx.id}</td>
              <td className="tx-date">{formatDateTime(tx.date)}</td>
              <td className="tx-tenant">
                <div className="tenant-info">
                  <div className="tenant-avatar" style={{ overflow: 'hidden' }}>
                    <img src={getAvatarUrl(tx.tenant, tx.avatarUrl)} alt={tx.tenant} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span>{tx.tenant}</span>
                </div>
              </td>
              <td className="tx-property">
                {tx.roomId ? (
                  <span 
                    onClick={() => navigate(`${ROUTES.ROOMS}/${tx.roomId}`)}
                    style={{ cursor: 'pointer', color: '#2563eb', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    {tx.property}
                  </span>
                ) : (
                  tx.property
                )}
              </td>
              <td className="tx-type">{tx.type}</td>
              <td className="tx-amount">{formatCurrency(tx.amount)}</td>
              <td className="tx-status">{getStatusBadge(tx.status)}</td>
              <td className="tx-actions">
                <div className="action-buttons">
                  <button className="btn-action-text" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '6px 12px',
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                  onClick={() => onViewInvoice && onViewInvoice(tx)}
                  >
                    <Eye size={16} /> {t('adminTransactions.viewInvoice')}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
