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

  // Get results to display
  const getResults = () => {
    if (interview?.bestScores && interview.bestScores.length > 0) {
      return interview.bestScores;
    }
    if (interview?.questionResults && interview.questionResults.length > 0) {
      return interview.questionResults.map(qr => ({
        questionTitle: qr.questionTitle,
        passed: qr.testSummary?.passed || 0,
        total: qr.testSummary?.total || 0
      }));
    }
    return [];
  };

  const results = getResults();

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

        {/* Show results summary */}
        {results.length > 0 && (
          <div className="completion-results">
            <h3>Your Results</h3>
            {results.map((result, idx) => {
              const passed = result.passed || 0;
              const total = result.total || 0;
              const isAccepted = passed === total && total > 0;
              return (
                <div key={idx} className={`result-row ${isAccepted ? 'accepted' : 'partial'}`}>
                  <span className="result-title">{result.questionTitle || `Question ${idx + 1}`}</span>
                  <span className="result-score">
                    {isAccepted ? '✓ Accepted' : `${passed}/${total}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}

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