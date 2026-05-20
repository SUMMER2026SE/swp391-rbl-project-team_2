import React from 'react';
import { CheckCircle } from 'lucide-react';
import Button from '../../../components/common/Button';
import './DepositSuccessCard.css';

/**
 * Deposit Successful Confirmation Card.
 * Displays transaction details with download receipt and dashboard actions.
 */
const DepositSuccessCard = ({
  amount = '$500',
  propertyName = 'The Metropolitan Loft',
  transactionId = '#TRX-88291A',
  date = 'Oct 24, 2023 • 14:32',
  onDownloadReceipt,
  onViewDashboard,
}) => {
  return (
    <div className="deposit-success-card">
      <div className="deposit-success-card__accent" />

      <div className="deposit-success-card__body">
        <div className="deposit-success-card__icon">
          <CheckCircle size={30} />
        </div>

        <h2 className="deposit-success-card__title">Deposit Successful</h2>
        <p className="deposit-success-card__subtitle">
          Your holding deposit of {amount} has been securely processed for {propertyName}.
        </p>

        <div className="deposit-success-card__details">
          <div className="deposit-success-card__detail-row">
            <span className="deposit-success-card__detail-label">Transaction ID</span>
            <span className="deposit-success-card__detail-value">{transactionId}</span>
          </div>
          <div className="deposit-success-card__detail-row">
            <span className="deposit-success-card__detail-label">Date</span>
            <span className="deposit-success-card__detail-value">{date}</span>
          </div>
        </div>

        <div className="deposit-success-card__actions">
          <Button
            variant="secondary"
            size="lg"
            onClick={onDownloadReceipt}
            id="btn-download-receipt"
          >
            Download Receipt
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={onViewDashboard}
            id="btn-view-dashboard"
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepositSuccessCard;
