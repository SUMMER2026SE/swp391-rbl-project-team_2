import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, X } from 'lucide-react';
import { authService } from '../services/authService';
import { ROUTES } from '../../../constants';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import './ChangePasswordModal.css';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await authService.changePassword({
        oldPassword,
        newPassword,
      });

      if (!response.success) throw new Error(response.message);

      alert('Password updated successfully!');
      onClose();
      
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    onClose();
    navigate(ROUTES.FORGOT_PASSWORD);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content change-password-modal">
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="modal-header">
          <div className="modal-icon-wrapper">
            <Lock size={24} />
          </div>
          <h2>Change Password</h2>
          <p>Update your password to keep your account secure.</p>
        </div>

        <form onSubmit={handleSubmit} className="change-password-form">
          <Input
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              if (error) setError('');
            }}
            rightLabel={
              <button type="button" onClick={handleForgotPassword} className="forgot-password-link">
                Forgot password?
              </button>
            }
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError('');
            }}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError('');
            }}
            error={error}
          />

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
