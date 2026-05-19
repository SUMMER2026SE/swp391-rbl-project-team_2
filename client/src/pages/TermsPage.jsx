import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Home, 
  ArrowLeft, 
  Printer, 
  Check, 
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { ROUTES } from '../constants';
import './TermsPage.css';

const SECTIONS = [
  {
    id: 'section-1',
    number: '1',
    title: 'Introduction',
    content: [
      'Welcome to SmartBoarding. These Terms and Conditions govern your use of the SmartBoarding platform, encompassing our website, mobile applications, and administrative consoles. By accessing or using our services, you agree to comply with and be bound by these terms.',
      'SmartBoarding serves as a premium digital marketplace connecting property managers and administrators with prospective long-term tenants. We facilitate secure transactions, identity verification, and lease management, ensuring a frictionless boarding experience.'
    ]
  },
  {
    id: 'section-2',
    number: '2',
    title: 'User Accounts & Verification',
    content: [
      'To access full functionalities of the platform, including booking requests and administrative management, you must register for an account. All information provided during registration must be accurate, current, and complete.'
    ],
    callout: {
      title: 'Identity Verification Requirement',
      text: 'For the security of all ecosystem participants, SmartBoarding employs rigorous KYC (Know Your Customer) protocols. Failure to provide adequate identification documentation may result in account suspension or termination of active bookings.'
    }
  },
  {
    id: 'section-3',
    number: '3',
    title: 'Bookings & Long-Term Leases',
    content: [
      'The platform allows users to request long-term stays. A booking is considered confirmed only upon explicit approval from the property administrator and subsequent execution of the digital lease agreement.'
    ],
    bullets: [
      'Digital signatures executed through the platform carry full legal weight.',
      'Standard lease durations are typically managed in 30-day increments unless otherwise specified.',
      'SmartBoarding acts as the facilitating agent, not the property owner.'
    ]
  },
  {
    id: 'section-4',
    number: '4',
    title: 'Payments, Fees & Deposits',
    content: [
      'All financial transactions must be conducted through the SmartBoarding secure payment gateway to ensure protection under our service guarantee. We support major credit cards and verified bank transfers.',
      'Security deposits are held in a neutral escrow account and are released subject to the property administrator\'s final inspection report upon termination of the lease. Platform service fees are non-refundable.'
    ]
  },
  {
    id: 'section-5',
    number: '5',
    title: 'Property Standards & Maintenance',
    content: [
      'Administrators must maintain properties in accordance with municipal housing safety standards. Tenants are expected to preserve the dwelling in a sanitary, undamaged state.',
      'Regular inspections can be coordinated with a minimum of 24 hours advance notification to ensure the highest standards of safety and compliance.'
    ]
  },
  {
    id: 'section-6',
    number: '6',
    title: 'Cancellations & Terminations',
    content: [
      'Lease terminations prior to the agreed duration are subject to the penalty clauses outlined in the digital lease agreement.',
      'Refund policies for security deposits adhere strictly to compliance regulations verified by the portal.'
    ]
  },
  {
    id: 'section-7',
    number: '7',
    title: 'Limitation of Liability',
    content: [
      'SmartBoarding acts solely as a connecting marketplace and administrative platform. We are not liable for direct, indirect, or accidental damages arising from tenancy disputes, landlord-tenant communication, or external financial transactions.'
    ]
  },
  {
    id: 'section-8',
    number: '8',
    title: 'Data Privacy & Security',
    content: [
      'Your privacy is paramount. SmartBoarding\'s encrypted transmission channels and cloud storage systems adhere strictly to modern compliance standards.',
      'Personal identifiable details are collected solely to facilitate identity checks, background checks, and payment authorizations.'
    ]
  }
];

const TermsPage = () => {
  const [activeSectionId, setActiveSectionId] = useState('section-1');
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRefs = useRef({});

  // Trigger Print Setup
  const handlePrint = () => {
    window.print();
  };

  // Scroll to a specific section smoothly
  const handleScrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const topOffset = 100; // Offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSectionId(id);
    }
  };

  // Tracking active section on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-120px 0px -60% 0px', // focused view area
      threshold: 0
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSectionId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    SECTIONS.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Text highlight helper
  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="highlighted-match">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="terms-page-container">
      {/* Dynamic Floating Standalone Header */}
      <header className="terms-standalone-header">
        <div className="terms-brand">
          <Home className="brand-logo-icon" size={22} />
          <span className="brand-name-text">SmartBoarding</span>
        </div>
        <Link to={ROUTES.LANDLORD.DASHBOARD} className="back-dashboard-btn">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </header>

      {/* Main Split Panels */}
      <div className="terms-split-layout">
        
        {/* Left Side: Navigation Sidebar */}
        <aside className="terms-sidebar-contents">
          {/* Search bar */}
          <div className="sidebar-search-box">
            <Search size={16} className="search-box-icon" />
            <input 
              type="text" 
              placeholder="Search document..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="search-box-input"
            />
          </div>

          {/* Heading */}
          <div className="contents-label-hdr">Contents</div>

          {/* Table of Contents list */}
          <nav className="contents-nav-menu">
            {SECTIONS.map(sec => (
              <button
                key={sec.id}
                onClick={() => handleScrollToSection(sec.id)}
                className={`content-nav-btn ${activeSectionId === sec.id ? 'active' : ''}`}
              >
                <ChevronRight size={14} className="nav-arrow-indicator" />
                <span className="nav-number-badge">{sec.number}.</span>
                <span className="nav-title-label">{sec.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Side: Document Content Scroll Area */}
        <main className="terms-main-document">
          <div className="document-paper-card">
            
            {/* Title Header */}
            <div className="document-header-block">
              <h1 className="doc-main-title">Terms & Conditions</h1>
              <p className="doc-last-updated">Last Updated: October 24, 2023</p>
            </div>

            {/* Document Sections */}
            <div className="document-sections-list">
              {SECTIONS.map(sec => (
                <section key={sec.id} id={sec.id} className="doc-content-section">
                  <h2 className="section-title-hdr">
                    {sec.number}. {sec.title}
                  </h2>

                  {/* Standard Paragraphs */}
                  {sec.content.map((pText, pIdx) => (
                    <p key={pIdx} className="section-paragraph-text">
                      {highlightText(pText, searchQuery)}
                    </p>
                  ))}

                  {/* Accent Callout Block */}
                  {sec.callout && (
                    <div className="section-callout-box">
                      <h4 className="callout-box-title">{sec.callout.title}</h4>
                      <p className="callout-box-desc">
                        {highlightText(sec.callout.text, searchQuery)}
                      </p>
                    </div>
                  )}

                  {/* Bullet Lists */}
                  {sec.bullets && (
                    <ul className="section-bullet-list">
                      {sec.bullets.map((bText, bIdx) => (
                        <li key={bIdx} className="section-bullet-item">
                          <Check size={16} className="bullet-checkmark-icon" />
                          <span>{highlightText(bText, searchQuery)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>

            {/* Document Footer Block */}
            <footer className="document-footer-block">
              <span className="doc-end-label">End of document.</span>
              <button className="btn-print-document-solid" onClick={handlePrint}>
                <Printer size={16} />
                <span>Print Document</span>
              </button>
            </footer>

          </div>
        </main>

      </div>
    </div>
  );
};

export default TermsPage;
