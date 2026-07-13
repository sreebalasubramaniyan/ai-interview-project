import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './IntervieweeDashboard.css';

const API_URL = 'http://localhost:5000/api/interviews';

export default function IntervieweeDashboard() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [code, setCode] = useState('// Write your solution here\n\nfunction solution(nums, target) {\n  // TODO: Implement your solution\n  \n}');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [output, setOutput] = useState(null);
  const timerRef = useRef(null);

  // Fetch interview and question data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get interview from sessionStorage
        const storedData = sessionStorage.getItem('interviewData');
        if (!storedData) {
          navigate(`/interview/${token}`);
          return;
        }

        const interviewData = JSON.parse(storedData);
        setInterview(interviewData);

        // If questionId exists, fetch the question details
        if (interviewData.questionId) {
          const questionResponse = await fetch(
            `http://localhost:5000/api/questions/${interviewData.questionId}`
          );
          if (questionResponse.ok) {
            const questionData = await questionResponse.json();
            setQuestion(questionData);
          }
        }

        // Mark interview as started
        await fetch(`${API_URL}/token/${token}/start`, {
          method: 'POST'
        });

        // Calculate time remaining
        if (interviewData.duration && interviewData.startedAt) {
          const startTime = new Date(interviewData.startedAt).getTime();
          const durationMs = interviewData.duration * 60 * 1000;
          const endTime = startTime + durationMs;
          const remaining = endTime - new Date().getTime();
          setTimeRemaining(remaining);
        } else if (interviewData.duration) {
          // If startedAt not set yet, use duration from scheduled time
          const durationMs = interviewData.duration * 60 * 1000;
          setTimeRemaining(durationMs);
        }
      } catch (err) {
        console.error('Error loading interview:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(timerRef.current);
          handleSubmit(true); // Auto-submit when time's up
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeRemaining]);

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00';

    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTimeLow = timeRemaining !== null && timeRemaining < 5 * 60 * 1000; // Less than 5 minutes

  const handleSubmit = async (isAutoSubmit = false) => {
    if (submitting) return;

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/token/${token}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submittedCode: code,
          language: language,
          isAutoSubmit: isAutoSubmit
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to completion page
        sessionStorage.removeItem('interviewData');
        navigate(`/interview/${token}/complete`, {
          state: {
            interview: data.interview,
            isAutoSubmit: isAutoSubmit
          }
        });
      } else {
        setOutput({ error: data.message || 'Failed to submit' });
        setShowOutput(true);
      }
    } catch (err) {
      setOutput({ error: 'Failed to connect to server' });
      setShowOutput(true);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'difficulty-easy';
      case 'Medium': return 'difficulty-medium';
      case 'Hard': return 'difficulty-hard';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="interviewee-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="interviewee-dashboard">
        <div className="dashboard-error">
          <h2>No Interview Data</h2>
          <p>Please access your interview through the link in your email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interviewee-dashboard">
      {/* Header */}
      <div className="coding-header">
        <div className="header-left">
          <h1 className="interview-title">{question?.title || interview.questionTitle}</h1>
        </div>
        <div className="header-center">
          <div className={`timer ${isTimeLow ? 'timer-low' : ''}`}>
            <span className="timer-icon">⏱</span>
            <span className="timer-time">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <div className="header-right">
          <select
            className="language-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button
            className="submit-btn"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="coding-main">
        {/* Left Panel - Question */}
        <div className="question-panel">
          <div className="question-header">
            <span className={`difficulty-badge ${getDifficultyClass(question?.difficulty)}`}>
              {question?.difficulty || 'Easy'}
            </span>
          </div>

          <div className="question-content">
            <h3>Description</h3>
            <p className="question-description">
              {question?.description || 'No description available'}
            </p>

            {question?.testCases && question.testCases.length > 0 && (
              <div className="examples-section">
                <h3>Examples</h3>
                {question.testCases.map((testCase, index) => (
                  <div key={index} className="example-box">
                    <p><strong>Example {index + 1}:</strong></p>
                    <div className="example-content">
                      <p><span className="example-label">Input:</span> <code>{testCase.input}</code></p>
                      <p><span className="example-label">Output:</span> <code>{testCase.output}</code></p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {question?.constraints && question.constraints.length > 0 && (
              <div className="constraints-section">
                <h3>Constraints</h3>
                <ul className="constraints-list">
                  {question.constraints.map((constraint, index) => (
                    <li key={index}><code>{constraint}</code></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="code-panel">
          <div className="code-header">
            <span>Solution</span>
          </div>
          <div className="code-editor">
            <textarea
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your solution here..."
              spellCheck="false"
            />
          </div>

          {/* Output Panel Toggle */}
          <div className="output-toggle">
            <button
              className="toggle-btn"
              onClick={() => setShowOutput(!showOutput)}
            >
              {showOutput ? 'Hide Output' : 'Show Output'}
            </button>
          </div>

          {/* Output Panel */}
          {showOutput && (
            <div className="output-panel">
              <div className="output-header">Output</div>
              <div className="output-content">
                {output ? (
                  output.error ? (
                    <div className="output-error">{output.error}</div>
                  ) : (
                    <pre>{JSON.stringify(output, null, 2)}</pre>
                  )
                ) : (
                  <p className="output-placeholder">Run your code to see output here.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}