import { useLocation, useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './CompletionScreen.css';

export default function CompletionScreen() {
  const { token } = useParams();
  const location = useLocation();
  const [interview, setInterview] = useState(null);
  const [isAutoSubmit, setIsAutoSubmit] = useState(false);

  useEffect(() => {
    if (location.state?.interview) {
      setInterview(location.state.interview);
      setIsAutoSubmit(location.state.isAutoSubmit || false);
    } else {
      // Try to get from sessionStorage
      const storedData = sessionStorage.getItem('interviewData');
      if (storedData) {
        setInterview(JSON.parse(storedData));
      }
    }
  }, [location.state]);

  // Clear session storage on unmount
  useEffect(() => {
    return () => {
      sessionStorage.removeItem('interviewData');
    };
  }, []);

  return (
    <div className="completion-screen">
      <div className="completion-card">
        <div className="completion-icon">
          {isAutoSubmit ? '⏰' : '✅'}
        </div>

        <h1>
          {isAutoSubmit ? 'Time\'s Up!' : 'Interview Submitted!'}
        </h1>

        <p className="completion-message">
          {isAutoSubmit
            ? 'Your solution has been automatically submitted due to time limit.'
            : 'Your solution has been successfully submitted.'
          }
        </p>

        <div className="completion-details">
          <div className="detail-row">
            <span className="detail-label">Question:</span>
            <span className="detail-value">{interview?.questionTitle || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Language:</span>
            <span className="detail-value">{interview?.language || interview?.result?.language || 'Not selected'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="detail-value status-completed">Completed</span>
          </div>
        </div>

        <div className="completion-note">
          <p>📧 The results have been sent to the admin.</p>
          <p>You may now close this window.</p>
        </div>

        <div className="completion-footer">
          <p className="thank-you">Thank you for completing the interview!</p>
        </div>
      </div>
    </div>
  );
}