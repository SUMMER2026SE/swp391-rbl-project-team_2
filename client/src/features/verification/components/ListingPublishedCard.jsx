import React from 'react';
import { Home, Check, Share2 } from 'lucide-react';
import Button from '../../../components/common/Button';
import './ListingPublishedCard.css';

/**
 * Listing Published Confirmation Card.
 * Shows that a property listing is live with share and preview actions.
 */
const ListingPublishedCard = ({
  listingName = 'Sunny Studio in Downtown',
  onShareListing,
  onPreview,
}) => {
  return (
    <div className="listing-published-card">
      <div className="listing-published-card__accent" />

      <div className="listing-published-card__body">
        <div className="listing-published-card__icon-wrap">
          <div className="listing-published-card__icon">
            <Home size={28} />
          </div>
          <div className="listing-published-card__badge">
            <Check size={12} />
          </div>
        </div>

        <h2 className="listing-published-card__title">Listing Published!</h2>
        <p className="listing-published-card__subtitle">
          "{listingName}" is now live and visible to potential tenants.
        </p>

        <div className="listing-published-card__share-btn">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={onShareListing}
            id="btn-share-listing"
          >
            <Share2 size={16} />
            Share Listing
          </Button>
        </div>

        <button
          className="listing-published-card__preview-link"
          onClick={onPreview}
          id="btn-preview-tenant"
        >
          Preview as Tenant
        </button>
      </div>
    </div>
  );
};

export default ListingPublishedCard;
