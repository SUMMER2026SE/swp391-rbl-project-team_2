import React, { useState, useRef } from 'react';
import { 
  Home, 
  CreditCard, 
  Wrench, 
  UploadCloud, 
  HelpCircle, 
  Lightbulb, 
  ExternalLink,
  MessageSquare,
  X,
  CheckCircle,
  FileText,
  User,
  Mail,
  Phone,
  AlertTriangle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import './HelpCenterPage.css';

const HelpCenterPage = () => {
  // Wizard Step State: 1 = Issue Details, 2 = Contact Info, 3 = Success
  const [step, setStep] = useState(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState('Property Listing');
  const [issueDescription, setIssueDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Step 2 Form State
  const [contactEmail, setContactEmail] = useState('admin@smartboarding.com');
  const [contactPhone, setContactPhone] = useState('+1 (555) 019-2834');
  const [urgencyLevel, setUrgencyLevel] = useState('Medium');

  // File Upload Reference
  const fileInputRef = useRef(null);

  // Live Chat Floating Widget State
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hello! Thanks for starting a live chat. How can I help you today? 💬' }
  ]);
  const [inputChatMessage, setInputChatMessage] = useState('');

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Mock Upload Handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB'
      });
      triggerToast(`File "${file.name}" attached successfully.`);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeAttachment = () => {
    setUploadedFile(null);
    triggerToast('Attachment removed.');
  };

  // Live Chat Send Message Handler
  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!inputChatMessage.trim()) return;

    const userMsg = inputChatMessage;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputChatMessage('');

    // Simulate Support response after 1s
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { sender: 'bot', text: 'Thanks for the details! Connecting you with a live support representative... 👨‍💻' }
      ]);
    }, 1000);
  };

  // Continue to Step 2
  const handleContinue = (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      triggerToast('Please describe your issue before continuing.');
      return;
    }
    setStep(2);
  };

  // Save Draft simulation
  const handleSaveDraft = () => {
    triggerToast('Ticket draft saved successfully.');
  };

  // Submit Ticket (leads to Step 3)
  const handleSubmitTicket = (e) => {
    e.preventDefault();
    setStep(3);
    triggerToast('Ticket submitted successfully!');
  };

  // Reset wizard back to Step 1
  const handleResetForm = () => {
    setStep(1);
    setIssueDescription('');
    setUploadedFile(null);
    setUrgencyLevel('Medium');
  };

  return (
    <div className="help-center-wrapper">
      {/* Toast notification */}
      {toastMessage && (
        <div className="help-toast-popup">
          <CheckCircle size={16} className="toast-check-icon" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header block */}
      <div className="help-hero-header">
        <h1 className="help-hero-title">How can we help you today?</h1>
        <p className="help-hero-subtitle">
          Submit a support ticket or chat with us live. We're here to ensure your SmartBoarding experience is seamless.
        </p>
      </div>

      {/* Grid split */}
      <div className="help-grid-split">
        
        {/* Left Column: Multi-Step Ticket Wizard Card */}
        <div className="help-wizard-card">
          
          {/* Form Header */}
          <header className="wizard-card-header">
            <div className="wizard-icon-badge">
              <FileText size={20} className="badge-icon" />
            </div>
            <div className="wizard-header-meta">
              <h3 className="wizard-card-title">Submit a Ticket</h3>
              <p className="wizard-card-subtitle">
                {step === 1 && 'Step 1 of 3: Issue Details'}
                {step === 2 && 'Step 2 of 3: Contact & Urgency'}
                {step === 3 && 'Step 3 of 3: Ticket Submitted'}
              </p>
            </div>
          </header>

          <div className="wizard-card-body">
            
            {/* STEP 1: Issue Details */}
            {step === 1 && (
              <form onSubmit={handleContinue} className="wizard-form-flow">
                
                {/* Category Selection */}
                <div className="wizard-field-group">
                  <label className="wizard-field-label">What do you need help with?</label>
                  <div className="category-selection-row">
                    
                    {/* Cat 1: Property Listing */}
                    <div 
                      onClick={() => setSelectedCategory('Property Listing')}
                      className={`category-select-pill ${selectedCategory === 'Property Listing' ? 'active' : ''}`}
                    >
                      <Home size={18} className="cat-icon" />
                      <span className="cat-text">Property Listing</span>
                    </div>

                    {/* Cat 2: Billing & Payments */}
                    <div 
                      onClick={() => setSelectedCategory('Billing & Payments')}
                      className={`category-select-pill ${selectedCategory === 'Billing & Payments' ? 'active' : ''}`}
                    >
                      <CreditCard size={18} className="cat-icon" />
                      <span className="cat-text">Billing & Payments</span>
                    </div>

                    {/* Cat 3: Technical Issue */}
                    <div 
                      onClick={() => setSelectedCategory('Technical Issue')}
                      className={`category-select-pill ${selectedCategory === 'Technical Issue' ? 'active' : ''}`}
                    >
                      <Wrench size={18} className="cat-icon" />
                      <span className="cat-text">Technical Issue</span>
                    </div>

                  </div>
                </div>

                {/* Issue Description Area */}
                <div className="wizard-field-group">
                  <label className="wizard-field-label">Describe the issue</label>
                  <textarea 
                    value={issueDescription}
                    onChange={e => setIssueDescription(e.target.value)}
                    placeholder="Please provide as much detail as possible so we can assist you quickly..."
                    className="wizard-textarea-input"
                    rows={6}
                  ></textarea>
                </div>

                {/* Upload Attachment Section */}
                <div className="wizard-field-group">
                  <label className="wizard-field-label">Attachments (Optional)</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }} 
                  />

                  {!uploadedFile ? (
                    <div 
                      onClick={triggerFileInput}
                      className="attachment-upload-zone"
                    >
                      <UploadCloud size={32} className="upload-zone-icon" />
                      <span className="upload-zone-main-text">Click to upload or drag and drop</span>
                      <span className="upload-zone-sub-text">SVG, PNG, JPG or GIF (max. 800x400px)</span>
                    </div>
                  ) : (
                    <div className="attached-file-preview-card">
                      <div className="attached-file-left">
                        <FileText size={20} className="file-preview-icon" />
                        <div className="file-preview-info">
                          <span className="file-preview-name">{uploadedFile.name}</span>
                          <span className="file-preview-size">{uploadedFile.size}</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={removeAttachment}
                        className="btn-remove-attachment"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Button actions row */}
                <div className="wizard-buttons-action-row">
                  <button 
                    type="button" 
                    onClick={handleSaveDraft}
                    className="btn-wizard-outline"
                  >
                    Save Draft
                  </button>
                  <button 
                    type="submit" 
                    className="btn-wizard-solid"
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

              </form>
            )}

            {/* STEP 2: Contact & Urgency */}
            {step === 2 && (
              <form onSubmit={handleSubmitTicket} className="wizard-form-flow">
                
                {/* Contact Email */}
                <div className="wizard-field-group">
                  <label className="wizard-field-label">Contact Email</label>
                  <div className="wizard-input-capsule">
                    <Mail size={16} className="input-capsule-icon" />
                    <input 
                      type="email" 
                      value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)}
                      required
                      placeholder="admin@smartboarding.com"
                      className="wizard-capsule-input"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div className="wizard-field-group">
                  <label className="wizard-field-label">Contact Phone Number</label>
                  <div className="wizard-input-capsule">
                    <Phone size={16} className="input-capsule-icon" />
                    <input 
                      type="tel" 
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      required
                      placeholder="+1 (555) 019-2834"
                      className="wizard-capsule-input"
                    />
                  </div>
                </div>

                {/* Urgency selection dropdown */}
                <div className="wizard-field-group">
                  <label className="wizard-field-label">Urgency Level</label>
                  <select 
                    value={urgencyLevel}
                    onChange={e => setUrgencyLevel(e.target.value)}
                    className="wizard-dropdown-select"
                  >
                    <option value="Low">Low - Minor issue or request</option>
                    <option value="Medium">Medium - Standard support inquiry</option>
                    <option value="High">High - Critical block (payments or checkin)</option>
                  </select>
                </div>

                {/* Information Callout */}
                <div className="wizard-form-callout-info">
                  <AlertTriangle size={18} className="callout-warn-icon" />
                  <p className="callout-text">
                    Our team will reach out to you via the provided email or phone number depending on the selected urgency. High urgency tickets are resolved in less than 30 minutes.
                  </p>
                </div>

                {/* Button actions row */}
                <div className="wizard-buttons-action-row">
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="btn-wizard-outline"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button 
                    type="submit" 
                    className="btn-wizard-solid"
                  >
                    <span>Submit Ticket</span>
                    <CheckCircle size={16} />
                  </button>
                </div>

              </form>
            )}

            {/* STEP 3: Success Screen */}
            {step === 3 && (
              <div className="wizard-success-pane">
                <div className="success-lottie-badge">
                  <CheckCircle size={56} className="lottie-check-icon" />
                </div>
                <h3 className="success-main-title">Ticket Submitted Successfully!</h3>
                <p className="success-sub-title">
                  Thank you! Your support ticket has been received. Our team has already started reviewing the details.
                </p>

                <div className="success-ticket-details-box">
                  <div className="ticket-detail-row">
                    <span className="detail-lbl">Ticket ID:</span>
                    <span className="detail-val font-mono">#SB-9854</span>
                  </div>
                  <div className="ticket-detail-row">
                    <span className="detail-lbl">Category:</span>
                    <span className="detail-val">{selectedCategory}</span>
                  </div>
                  <div className="ticket-detail-row">
                    <span className="detail-lbl">Urgency:</span>
                    <span className="detail-val urgency-badge">{urgencyLevel}</span>
                  </div>
                  <div className="ticket-detail-row">
                    <span className="detail-lbl">Average Response Time:</span>
                    <span className="detail-val highlight-time">15 minutes</span>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleResetForm}
                  className="btn-wizard-solid full-width"
                >
                  Create New Ticket
                </button>
              </div>
            )}

          </div>

        </div>

        {/* Right Column: Widgets stack */}
        <aside className="help-sidebar-widgets">
          
          {/* Widget 1: Need immediate help */}
          <div className="widget-card chat-promo-widget">
            <div className="chat-promo-icon-circle">
              <MessageSquare size={20} />
            </div>
            <h3 className="chat-promo-title">Need immediate help?</h3>
            <p className="chat-promo-desc">
              Our support team is currently online and ready to assist you right now.
            </p>
            <button 
              onClick={() => setShowLiveChat(true)}
              className="btn-chat-promo-action"
            >
              <span className="pulse-active-dot"></span>
              <span>Start Live Chat</span>
            </button>
          </div>

          {/* Widget 2: Quick Answers */}
          <div className="widget-card quick-answers-widget">
            <header className="widget-card-header-sub">
              <Lightbulb size={18} className="widget-icon-yellow" />
              <h4 className="widget-title-sub">Quick Answers</h4>
            </header>

            <div className="faq-mini-stack">
              <div className="faq-mini-item">
                <h5 className="faq-question">How do I update my billing info?</h5>
                <p className="faq-answer">Navigate to Settings &gt; Billing to update cards.</p>
              </div>

              <div className="faq-mini-item">
                <h5 className="faq-question">When will my listing go live?</h5>
                <p className="faq-answer">Most listings are approved within 24 hours.</p>
              </div>
            </div>

            <footer className="widget-card-footer-sub">
              <a 
                href="#knowledge-base" 
                onClick={(e) => {
                  e.preventDefault();
                  triggerToast('Redirecting to full Knowledge Base center...');
                }}
                className="kb-footer-link"
              >
                <span>View Knowledge Base</span>
                <ExternalLink size={14} />
              </a>
            </footer>
          </div>

        </aside>

      </div>

      {/* Floating Live Chat Mock Dialog */}
      {showLiveChat && (
        <div className="floating-live-chat-panel">
          <header className="chat-panel-header">
            <div className="chat-panel-hdr-left">
              <span className="chat-hdr-pulse-dot"></span>
              <div className="chat-hdr-meta">
                <h5>Live Chat Agent</h5>
                <span>Online & Ready</span>
              </div>
            </div>
            <button 
              onClick={() => setShowLiveChat(false)}
              className="chat-hdr-close-btn"
            >
              <X size={16} />
            </button>
          </header>

          <div className="chat-panel-body">
            <div className="chat-messages-container">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message-bubble ${msg.sender}`}>
                  <span className="msg-avatar">{msg.sender === 'bot' ? '👩‍💻' : '👤'}</span>
                  <div className="msg-text">{msg.text}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChatMessage} className="chat-panel-form-input">
              <input 
                type="text" 
                value={inputChatMessage}
                onChange={e => setInputChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="chat-panel-textbox"
              />
              <button type="submit" className="chat-panel-send-btn">
                Send
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default HelpCenterPage;
