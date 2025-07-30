import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LoginWithOTP.css';
import { useNavigate } from 'react-router-dom';
import { Send , LogIn , MoveLeft } from 'lucide-react';

const LoginWithOTP = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user_id');
    if (userData && typeof onLogin === 'function') {
      onLogin({ user_id: userData });
    }
  }, [onLogin]);

  useEffect(() => {
    if (remainingTime <= 0) return;
    const timer = setTimeout(() => setRemainingTime(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingTime]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('http://localhost:8000/admin/send-otp', { email });

      if (response.status >= 200 && response.status < 300) {
        setStep('otp');
        setRemainingTime(120);
        setMessage({ text: `OTP has been sent to ${email}`, type: 'success' });
      } else {
        throw new Error('Unexpected response');
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to send OTP',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('http://localhost:8000/admin/verify-otp', {
        email: email.trim().toLowerCase(),
        otp: parseInt(otp, 10),
      });

      if (response.status >= 200 && response.status < 300) {
        const userData = response.data.data || {};
        localStorage.setItem('user_id', userData.user_id || '1');
        localStorage.setItem('user_details', JSON.stringify(userData) || '');
        if (typeof onLogin === 'function') onLogin(userData);
        setMessage({ text: 'Login successful!', type: 'success' });
        navigate('/leads');
      } else {
        throw new Error('OTP verification failed');
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Verification failed',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await axios.post('http://localhost:8000/admin/send-otp', { email });

      if (response.status >= 200 && response.status < 300) {
        setRemainingTime(120);
        setMessage({ text: 'A new OTP has been sent!', type: 'success' });
      } else {
        throw new Error('Failed to resend OTP');
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to resend OTP',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-heading">Sales Lite</div>
        <h2 className="login-title">{step === 'email' ? 'Sign into your account' : 'Verify the otp from your email'}</h2>

        {message.text && (
          <div className={`login-message login-message--${message.type}`}>
            {message.text}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="login-form">
            <div className="login-group">
              <label htmlFor="email" className="login-label">Email Address</label>
              <input
                type="email"
                id="email"
                className="login-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <button type="submit" disabled={isLoading} className="login-button">
              {isLoading ? 'Sending...' : 'Send OTP'} <Send width={16} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="login-form">
            <div className="login-group">
              {/* <label htmlFor="otp" className="login-label">6-digit OTP</label> */}
              <input
                type="number"
                id="otp"
                className="login-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                inputMode="numeric"
                placeholder="Enter OTP"
              />
              <div className="login-otp-footer">
                {remainingTime > 0 ? (
                  <span className="login-timer">
                    Resend in {Math.floor(remainingTime / 60)}:
                    {(remainingTime % 60).toString().padStart(2, '0')}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="resend-button"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="login-button">
              {isLoading ? 'Verifying...' : 'Verify OTP'} <LogIn width={18} />
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setMessage({ text: '', type: '' });
              }}
              className="login-back"
            >
              <MoveLeft /> Back to Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginWithOTP;
