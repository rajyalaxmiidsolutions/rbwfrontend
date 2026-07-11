import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP, resendOTP } from '../services/api';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (!email) navigate('/signup');
  }, [email]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const { data } = await verifyOTP({ email, otp });
      loginUser(data.token, data.user);
      toast.success('Email verified!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ email, purpose: 'verification' });
      setResendTimer(60);
      toast.success('OTP resent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-text mb-2">Verify Email</h2>
      <p className="text-sm text-gray-500 mb-6">Enter the 6-digit OTP sent to <span className="font-medium text-text">{email}</span></p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter OTP"
            maxLength={6}
            className="w-full px-4 py-3 bg-bg border border-border rounded-xl text-center text-lg font-semibold tracking-[0.3em] focus:outline-none focus:border-burgundy"
          />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-burgundy text-white py-3 rounded-xl font-semibold text-sm hover:bg-burgundy-600 transition-colors disabled:opacity-50">
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </form>
      <div className="mt-4 text-center">
        {resendTimer > 0 ? (
          <p className="text-sm text-gray-400">Resend OTP in {resendTimer}s</p>
        ) : (
          <button onClick={handleResend} className="text-sm text-burgundy font-medium hover:underline">Resend OTP</button>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;
