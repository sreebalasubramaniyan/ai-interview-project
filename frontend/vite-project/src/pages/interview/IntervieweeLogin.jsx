import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL, { API_URL as URLs } from '../../config';
import './IntervieweeLogin.css';

export default function IntervieweeLogin() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [interview, setInterview] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Fetch interview details on mount
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await fetch(`${API_URL}/token/${token}`);
        const data = await response.json();

        if (response.ok && data) {
          setInterview(data);

          // Check if interview time has started
          const scheduledTime = new Date(data.scheduledAt).getTime();
          const now = new Date().getTime();
          const diff = scheduledTime - now;

          if (diff > 0) {
            // Interview hasn't started yet - set time remaining
            setTimeRemaining(diff);
          }
          // If diff <= 0, interview has started - allow login
        } else {
          setError('Interview not found');
        }
      } catch (err) {
        setError('Failed to connect to server. Please try again.');
      } finally {
        setChecking(false);
      }
    };

    fetchInterview();
  }, [token]);

  // Countdown timer
  useEffect(() => {
    if (!timeRemaining) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          // Time's up - refresh to allow login
          window.location.reload();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00:00';

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatScheduledDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${URLs.BASE}/token/${token}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intervieweeEmail: email, secretCode }),
      });

      const data = await response.json();

      if (data.valid) {
        // Store interview data in sessionStorage for the dashboard
        sessionStorage.setItem('interviewData', JSON.stringify(data.interview));
        navigate(`/interview/${token}/start`);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="interviewee-login-page">
        <div className="interviewee-login-card">
          <div className="loading-spinner"></div>
          <p>Loading interview...</p>
        </div>
      </div>
    );
  }

  // Interview not found
  if (error && !interview) {
    return (
      <div className="interviewee-login-page">
        <div className="interviewee-login-card">
          <h1>AI Interview</h1>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  // Interview hasn't started yet - show countdown
  if (timeRemaining && timeRemaining > 0) {
    return (
      <div className="interviewee-login-page">
        <div className="interviewee-login-card waiting-card">
          <div className="waiting-icon">⏰</div>
          <h1>Interview Not Yet Started</h1>
          <p className="waiting-text">
            Your interview is scheduled for:
          </p>
          <p className="scheduled-time">
            {formatScheduledDate(interview?.scheduledAt)}
          </p>

          <div className="countdown-timer">
            <p className="countdown-label">Time remaining:</p>
            <div className="countdown-time">{formatTime(timeRemaining)}</div>
          </div>

          <p className="waiting-hint">
            This page will automatically update when it's time to start.<br/>
            Please come back at the scheduled time.
          </p>

          <div className="credentials-preview">
            <p>Your credentials:</p>
            <p>Email: <strong>{interview?.intervieweeEmail}</strong></p>
            <p>Code: <strong>{interview?.secretCode}</strong></p>
          </div>
        </div>
      </div>
    );
  }

  // Interview has started - show login form
  return (
    <div className="interviewee-login-page">
      <div className="interviewee-login-card">
        <h1>AI Interview</h1>
        <h2>Enter Your Credentials</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Secret Code</label>
            <input
              type="text"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              placeholder="Enter 4-digit code"
              maxLength={4}
              required
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Verifying...' : 'Start Interview'}
          </button>
        </form>
      </div>
    </div>
  );
}