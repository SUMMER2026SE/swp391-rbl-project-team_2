const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Send OTP email to user
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} purpose - 'verify_email' or 'forgot_password'
 */
const sendOtpEmail = async (toEmail, otpCode, purpose) => {
  try {
    const isVerify = purpose === 'verify_email';
    const isSignContract = purpose === 'sign_contract';
    
    let subject = '🔐 Verify Your Email - Smart Rental Room System';
    if (!isVerify) subject = '🔑 Reset Your Password - Smart Rental Room System';
    if (isSignContract) subject = '✍️ Contract Signature OTP - Smart Rental Room System';

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1e293b; font-size: 24px; margin: 0 0 8px 0;">
            ${isVerify ? '📧 Email Verification' : (isSignContract ? '✍️ Contract Signature' : '🔑 Password Reset')}
          </h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            ${isVerify
              ? 'Please use the code below to verify your email address.'
              : (isSignContract ? 'Please use the code below to sign your rental contract.' : 'Please use the code below to reset your password.')}
          </p>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">Your OTP Code</p>
          <h2 style="color: #ffffff; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: 700;">${otpCode}</h2>
        </div>
        
        <p style="color: #ef4444; font-size: 13px; text-align: center; margin: 16px 0;">
          ⏰ This code will expire in <strong>5 minutes</strong>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          If you did not request this code, please ignore this email.<br/>
          &copy; 2026 Smart Rental Room System
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Smart Rental Room System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: html,
    });

    console.log(`✅ OTP email sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.log(`🔑 [DEVELOPMENT BYPASS] OTP Code for ${toEmail} is: ${otpCode}`);
    // DO NOT throw error here so that development works even without SMTP configured!
  }
};

const sendContractEmail = async (toEmail, contractNumber, pdfBase64) => {
  try {
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1e293b; font-size: 24px; margin: 0 0 8px 0;">
            📄 Contract Signed
          </h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">
            Your rental contract has been successfully signed!
          </p>
        </div>
        
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Hello, <br/><br/>
          The rental contract <strong>${contractNumber}</strong> has been successfully signed by the tenant.
          Please find the signed contract document attached to this email as a PDF.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          &copy; 2026 Smart Rental Room System
        </p>
      </div>
    `;

    // pdfBase64 is data:application/pdf;base64,....
    const base64Data = pdfBase64.split(';base64,').pop();

    await transporter.sendMail({
      from: `"Smart Rental Room System" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `📄 Signed Contract: ${contractNumber}`,
      html: html,
      attachments: [
        {
          filename: `Contract_${contractNumber}.pdf`,
          content: base64Data,
          encoding: 'base64',
          contentType: 'application/pdf'
        }
      ]
    });

    console.log(`✅ Contract email sent to ${toEmail}`);
  } catch (error) {
    console.error('❌ Error sending contract email:', error.message);
  }
};

module.exports = {
  sendOtpEmail,
  sendContractEmail
};
