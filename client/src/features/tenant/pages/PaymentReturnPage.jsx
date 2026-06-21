import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../../../services/api';
import Button from '../../../components/common/Button';
import './PaymentReturnPage.css';

const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const queryParams = searchParams.toString();
        const response = await api.get(`/tenant/payments/vnpay_return?${queryParams}`);
        
        if (response.success && response.code === '00') {
          setStatus('success');
          setMessage('Deposit payment completed successfully!');
          setInvoiceData(response.data);
        } else {
          setStatus('error');
          setMessage(response.message || 'Payment failed or was cancelled.');
          if (response.data) setInvoiceData(response.data);
        }
      } catch (err) {
        setStatus('error');
        setMessage('An error occurred while verifying the payment.');
      }
    };

    if (searchParams.get('vnp_ResponseCode')) {
      processPaymentReturn();
    } else {
      setStatus('error');
      setMessage('Invalid payment response.');
    }
  }, [searchParams]);

  return (
    <div className="payment-return-container">
      <div className="payment-return-card">
        {status === 'processing' && (
          <>
            <div className="icon-wrapper processing">
              <Loader size={48} className="animate-spin" />
            </div>
            <h2 className="payment-return-title">Processing Payment</h2>
            <p className="payment-return-message">Please wait while we verify your transaction...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="icon-wrapper success">
              <CheckCircle size={64} />
            </div>
            <h2 className="payment-return-title">Payment Successful!</h2>
            <p className="payment-return-message">{message}</p>
            
            {invoiceData && (
              <div className="premium-invoice animate-fade-in-up">
                <div className="invoice-header">
                  <div className="text-sm font-medium text-blue-100 uppercase tracking-wider">Payment Receipt</div>
                  <div className="invoice-amount">
                    {invoiceData.amount?.toLocaleString('vi-VN')}<span>VND</span>
                  </div>
                  <div className="text-xs text-blue-200 mt-1">{new Date(invoiceData.paid_date || Date.now()).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</div>
                </div>
                
                <div className="invoice-body">
                  <div className="invoice-divider"></div>
                  
                  <div className="invoice-row mt-4">
                    <span className="invoice-label">Transaction ID</span>
                    <span className="invoice-value text-blue-600 font-mono">{invoiceData.transaction_id || 'N/A'}</span>
                  </div>
                  
                  <div className="invoice-row">
                    <span className="invoice-label">Payment Type</span>
                    <span className="invoice-pill capitalize">{invoiceData.payment_type?.replace('_', ' ')}</span>
                  </div>
                  
                  <div className="invoice-section">
                    <div className="invoice-section-title">Room Details</div>
                    <div className="text-gray-900 font-semibold text-base mb-1">{invoiceData.room?.title}</div>
                    <div className="text-gray-500 text-xs leading-relaxed">
                      {[invoiceData.room?.address, invoiceData.room?.ward, invoiceData.room?.district, invoiceData.room?.city].filter(Boolean).join(', ')}
                    </div>
                  </div>
                  
                  <div className="invoice-section">
                    <div className="invoice-section-title">Landlord Contact</div>
                    <div className="flex items-center gap-3 mt-2">
                      <div>
                        <div className="text-gray-900 font-semibold">{invoiceData.landlord?.full_name}</div>
                        <div className="text-gray-500 text-xs mt-0.5">{invoiceData.landlord?.phone || 'No phone provided'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="payment-return-actions flex gap-4 mt-6">
              <Button onClick={() => navigate('/tenant/deposit-history')} className="w-full">
                Deposit History
              </Button>
              <Button variant="outline" onClick={() => navigate('/tenant/requests')} className="w-full">
                My Requests
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="icon-wrapper error">
              <XCircle size={64} />
            </div>
            <h2 className="payment-return-title">Payment Failed</h2>
            <p className="payment-return-message">{message}</p>
            <div className="payment-return-actions">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button onClick={() => navigate('/tenant/requests')}>
                My Requests
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentReturnPage;
