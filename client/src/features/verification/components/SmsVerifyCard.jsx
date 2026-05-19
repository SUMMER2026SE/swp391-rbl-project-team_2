import React from 'react';
import { MessageSquare } from 'lucide-react';
import './SmsVerifyCard.css';

/**
 * SMS Verification Card.
 * Displays the "Verify via SMS" option with masked phone number.
 */
const SmsVerifyCard = ({ phone = '***-***-8912', onSendSms }) => {
  return (
    <div className="sms-verify-card">
      <div className="sms-verify-card__content">
        <div className="sms-verify-card__icon">
          <MessageSquare size={22} />
        </div>
        <div>
          <div className="sms-verify-card__title">Verify via SMS</div>
          <div className="sms-verify-card__phone">Send code to {phone}</div>
        </div>
      </div>

      <button
        className="sms-verify-card__btn"
        onClick={onSendSms}
        id="btn-send-sms"
      >
        Send SMS
      </button>
    </div>
  );
};

export default SmsVerifyCard;
