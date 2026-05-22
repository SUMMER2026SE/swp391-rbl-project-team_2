import React from 'react';
import { Shield } from 'lucide-react';

import EmailVerifyCard from '../components/EmailVerifyCard';
import SmsVerifyCard from '../components/SmsVerifyCard';
import DepositSuccessCard from '../components/DepositSuccessCard';
import ListingPublishedCard from '../components/ListingPublishedCard';
import './VerificationPage.css';

/**
 * Verification & Modals Showcase Page.
 * Displays all verification / confirmation card components
 * in a two-column grid, matching the Figma design.
 */
const VerificationPage = () => {
  /* ── Event handlers (can be wired to real APIs later) ── */
  const handleVerifyEmail = async (code) => {
    // Simulate async verification
    console.log('Verifying email with code:', code);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  const handleResendCode = () => {
    console.log('Resending verification code...');
  };

  const handleSendSms = () => {
    console.log('Sending SMS verification...');
  };

  const handleDownloadReceipt = () => {
    console.log('Downloading receipt...');
  };

  const handleViewDashboard = () => {
    console.log('Navigating to dashboard...');
  };

  const handleShareListing = () => {
    console.log('Sharing listing...');
  };

  const handlePreviewAsTenant = () => {
    console.log('Previewing as tenant...');
  };

  return (
    <div className="verification-page">
      {/* Section Label */}
      <div className="verification-page__section-label">
        Verification &amp; Confirmation Screens
      </div>

      {/* Page Header */}
      <div className="verification-page__header">
        <div>
          <h1 className="verification-page__title">Verification &amp; Modals</h1>
          <p className="verification-page__desc">
            Showcase of security flows and confirmation states.
          </p>
        </div>
        <div className="verification-page__brand">
          <div className="verification-page__brand-icon">
            <Shield size={16} />
          </div>
          RentalRoom
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="verification-page__grid">
        {/* Left Column */}
        <div className="verification-page__col">
          <EmailVerifyCard
            email="alex@example.com"
            onVerify={handleVerifyEmail}
            onResend={handleResendCode}
          />
          <SmsVerifyCard
            phone="***-***-8912"
            onSendSms={handleSendSms}
          />
        </div>

        {/* Right Column */}
        <div className="verification-page__col">
          <DepositSuccessCard
            amount="$500"
            propertyName="The Metropolitan Loft"
            transactionId="#TRX-88291A"
            date="Oct 24, 2023 • 14:32"
            onDownloadReceipt={handleDownloadReceipt}
            onViewDashboard={handleViewDashboard}
          />
          <ListingPublishedCard
            listingName="Sunny Studio in Downtown"
            onShareListing={handleShareListing}
            onPreview={handlePreviewAsTenant}
          />
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
