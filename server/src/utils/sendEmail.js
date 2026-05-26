const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send OTP email to user
 * @param {string} toEmail - Recipient email
 * @param {string} otpCode - 6-digit OTP code
 * @param {string} purpose - 'verify_email' or 'forgot_password'
 */
const sendOtpEmail = async (toEmail, otpCode, purpose) => {
  const isVerify = purpose === 'verify_email';
  
  const subject = isVerify
    ? '🔐 Verify Your Email - Smart Rental Room System'
    : '🔑 Reset Your Password - Smart Rental Room System';

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1e293b; font-size: 24px; margin: 0 0 8px 0;">
          ${isVerify ? '📧 Email Verification' : '🔑 Password Reset'}
        </h1>
        <p style="color: #64748b; font-size: 14px; margin: 0;">
          ${isVerify
            ? 'Please use the code below to verify your email address.'
            : 'Please use the code below to reset your password.'}
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
};

module.exports = sendOtpEmail;
