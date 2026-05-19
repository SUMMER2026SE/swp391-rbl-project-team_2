import React from 'react';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import './TransactionTable.css';

const TransactionTable = ({ transactions }) => {
  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="status-badge status-completed">Completed</span>;
      case 'pending':
        return <span className="status-badge status-pending">Pending</span>;
      case 'failed':
        return <span className="status-badge status-failed">Failed</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="transaction-table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Date & Time</th>
            <th>Tenant</th>
            <th>Property</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="tx-id">#{tx.id}</td>
              <td className="tx-date">{formatDateTime(tx.date)}</td>
              <td className="tx-tenant">
                <div className="tenant-info">
                  <div className="tenant-avatar">
                    {tx.tenant.charAt(0)}
                  </div>
                  <span>{tx.tenant}</span>
                </div>
              </td>
              <td className="tx-property">{tx.property}</td>
              <td className="tx-type">{tx.type}</td>
              <td className="tx-amount">{formatCurrency(tx.amount)}</td>
              <td className="tx-status">{getStatusBadge(tx.status)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
