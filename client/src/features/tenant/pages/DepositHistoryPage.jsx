import React from 'react';
import { BedDouble, CheckCircle2, AlertCircle, Clock3, Download, RotateCw } from 'lucide-react';
import './DepositHistoryPage.css';

// Mock data matching the Figma design
const MOCK_DEPOSITS = [
  {
    id: 1,
    date: 'Oct 24, 2024',
    roomName: 'The Brooklyn Loft',
    amount: 1250.00,
    status: 'Success',
    invoiceAvailable: true
  },
  {
    id: 2,
    date: 'Oct 15, 2024',
    roomName: 'Downtown Studio B',
    amount: 850.00,
    status: 'Pending',
    invoiceAvailable: false
  },
  {
    id: 3,
    date: 'Sep 01, 2024',
    roomName: 'Riverside Suite',
    amount: 2100.00,
    status: 'Failed',
    invoiceAvailable: false
  },
  {
    id: 4,
    date: 'Aug 24, 2024',
    roomName: 'The Brooklyn Loft',
    amount: 1250.00,
    status: 'Success',
    invoiceAvailable: true
  }
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'Success':
      return (
        <span className="status-badge status-success">
          <CheckCircle2 size={14} />
          <span>Success</span>
        </span>
      );
    case 'Pending':
      return (
        <span className="status-badge status-pending">
          <Clock3 size={14} />
          <span>Pending</span>
        </span>
      );
    case 'Failed':
      return (
        <span className="status-badge status-failed">
          <AlertCircle size={14} />
          <span>Failed</span>
        </span>
      );
    default:
      return null;
  }
};

const getInvoiceAction = (status, invoiceAvailable) => {
  if (status === 'Success' && invoiceAvailable) {
    return (
      <button className="action-btn action-download">
        <Download size={16} />
        <span>PDF</span>
      </button>
    );
  }
  if (status === 'Pending') {
    return <span className="action-text-muted">Not available</span>;
  }
  if (status === 'Failed') {
    return (
      <button className="action-btn action-retry" onClick={() => alert('Redirecting to payment page to retry...')}>
        <RotateCw size={16} />
        <span>Retry</span>
      </button>
    );
  }
  return null;
};

const DepositHistoryPage = () => {
  return (
    <div className="deposit-history-page">
      <div className="container">
        
        <div className="page-header">
          <h1>Deposit History</h1>
          <p>Review your past payments, deposits, and transaction statuses.</p>
        </div>

        <div className="table-container">
          <table className="deposit-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Room Name</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="align-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_DEPOSITS.map((deposit) => (
                <tr key={deposit.id}>
                  <td className="col-date">{deposit.date}</td>
                  <td className="col-room">
                    <div className="room-info">
                      <BedDouble size={16} className="text-primary" />
                      <span>{deposit.roomName}</span>
                    </div>
                  </td>
                  <td className="col-amount">
                    ${deposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="col-status">
                    {getStatusBadge(deposit.status)}
                  </td>
                  <td className="col-invoice align-right">
                    {getInvoiceAction(deposit.status, deposit.invoiceAvailable)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default DepositHistoryPage;
