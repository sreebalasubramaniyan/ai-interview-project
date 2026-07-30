import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeEditor from '../../components/interview/CodeEditor';
import API_URL, { API_URL as URLs } from '../../config';
import './IntervieweeDashboard.css';

export default function IntervieweeDashboard() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [code, setCode] = useState('// Write your solution here\n\nfunction solution(input) {\n  // TODO: Implement your solution\n  // input contains the JSON object from test case\n  // Example: input = {"nums":[2,7,11,15],"target":9}\n  return [];\n}');
  const [language, setLanguage] = useState('javascript');
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const [output, setOutput] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [questionStatuses, setQuestionStatuses] = useState({}); // { questionIndex: 'accepted' | 'attempted' | 'not_attempted' }
  const [bestScores, setBestScores] = useState({}); // { questionIndex: { passed, total } }
  const [interviewCompleted, setInterviewCompleted] = useState(false);

  // Resizable console panel
  const [consoleHeight, setConsoleHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const consoleRef = useRef(null);
  const timerRef = useRef(null);

  // Fetch interview and question data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/token/${token}`);

        if (!response.ok) {
          const storedData = sessionStorage.getItem('interviewData');
          if (!storedData) {
            navigate(`/interview/${token}`);
            return;
          }
          const interviewData = JSON.parse(storedData);
          setInterview(interviewData);

          if (interviewData.questions && interviewData.questions.length > 0) {
            // Fetch full question data - handle both populated and non-populated questionId
            const questionPromises = interviewData.questions.map(q => {
              // If questionId is already an object with _id, use it directly
              if (typeof q.questionId === 'object' && q.questionId?._id) {
                return Promise.resolve(q.questionId);
              }
              // Otherwise fetch by ID
              return fetch(`${URLs.QUESTIONS}/${q.questionId}`).then(res => res.json());
            });
            const questionDataArray = await Promise.all(questionPromises);
            setQuestions(questionDataArray);
            if (questionDataArray.length > 0) {
              setQuestion(questionDataArray[0]);
              setCurrentQuestionIndex(0);
            }
          } else if (interviewData.questionId) {
            const questionId = typeof interviewData.questionId === 'object'
              ? interviewData.questionId._id
              : interviewData.questionId;
            const questionResponse = await fetch(
              `${URLs.QUESTIONS}/${questionId}`
            );
            if (questionResponse.ok) {
              const questionData = await questionResponse.json();
              setQuestion(questionData);
              setQuestions([questionData]);
            }
          }
        } else {
          const interviewData = await response.json();
          setInterview(interviewData);
          sessionStorage.setItem('interviewData', JSON.stringify(interviewData));

          if (interviewData.questions && interviewData.questions.length > 0) {
            // Fetch full question data - handle both populated and non-populated questionId
            const questionPromises = interviewData.questions.map(q => {
              // If questionId is already an object with _id, use it directly
              if (typeof q.questionId === 'object' && q.questionId?._id) {
                return Promise.resolve(q.questionId);
              }
              // Otherwise fetch by ID
              return fetch(`${URLs.QUESTIONS}/${q.questionId}`).then(res => res.json());
            });
            const questionDataArray = await Promise.all(questionPromises);
            setQuestions(questionDataArray);
            if (questionDataArray.length > 0) {
              setQuestion(questionDataArray[0]);
              setCurrentQuestionIndex(0);
            }
          } else if (interviewData.questionId) {
            const questionId = typeof interviewData.questionId === 'object'
              ? interviewData.questionId._id
              : interviewData.questionId;
            const questionResponse = await fetch(
              `${URLs.QUESTIONS}/${questionId}`
            );
            if (questionResponse.ok) {
              const questionData = await questionResponse.json();
              setQuestion(questionData);
              setQuestions([questionData]);
            }
          }
        }

        await fetch(`${API_URL}/token/${token}/start`, {
          method: 'POST'
        });

        const interviewData = sessionStorage.getItem('interviewData')
          ? JSON.parse(sessionStorage.getItem('interviewData'))
          : interview;

        // Calculate time based on scheduledAt and duration (not startedAt)
        if (interviewData?.scheduledAt && interviewData?.duration) {
          const scheduledTime = new Date(interviewData.scheduledAt).getTime();
          const now = new Date().getTime();
          const durationMs = interviewData.duration * 60 * 1000;
          const endTime = scheduledTime + durationMs;
          const remaining = endTime - now;

          if (remaining > 0) {
            setTimeRemaining(remaining);
          } else if (now < scheduledTime) {
            // Interview hasn't started yet, show wait time
            setTimeRemaining(null);
          } else {
            // Interview has ended
            setTimeRemaining(0);
          }
        } else if (interviewData?.duration) {
          // Fallback: duration from when user starts (shouldn't happen)
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

  // Auto-finish interview when time runs out
  const handleAutoFinish = useCallback(async () => {
    if (interviewCompleted || !question?._id) return;

    console.log('Time is up! Auto-submitting...');

    try {
      // Try to submit current code
      let testSummary = null;
      let executionResults = [];

      try {
        const execResponse = await fetch(`${URLs.EXECUTE}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language, questionId: getCurrentQuestionId() })
        });

        if (execResponse.ok) {
          const execData = await execResponse.json();
          testSummary = execData.summary;
          executionResults = execData.results || [];

          if (testSummary) {
            updateQuestionStatus(currentQuestionIndex, testSummary.passed, testSummary.total);
          }
        }
      } catch (e) {
        console.error('Auto-submit execution failed:', e);
      }

      // Finish the interview
      const finishResponse = await fetch(`${API_URL}/token/${token}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedCode: code,
          language,
          questionIndex: currentQuestionIndex,
          testSummary: testSummary,
          executionResults: executionResults,
          completionType: 'time_up'
        })
      });

      const finishData = await finishResponse.json();

      if (finishResponse.ok) {
        setInterviewCompleted(true);
        setInterview(finishData.interview);
        // Navigate directly to completion screen
        navigate(`/interview/${token}/complete`, {
          state: { interview: finishData.interview, isAutoSubmit: true }
        });
      }
    } catch (err) {
      console.error('Auto-finish failed:', err);
    }
  }, [token, code, language, question, currentQuestionIndex, interviewCompleted, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining === null) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(timerRef.current);
          // Time's up - auto-submit and finish interview
          handleAutoFinish();
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
  }, [timeRemaining, handleAutoFinish]);

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTimeLow = timeRemaining !== null && timeRemaining < 5 * 60 * 1000;

  // Update question status based on submission results
  const updateQuestionStatus = useCallback((questionIndex, passed, total) => {
    const isAccepted = passed === total && total > 0;
    setQuestionStatuses(prev => ({
      ...prev,
      [questionIndex]: isAccepted ? 'accepted' : 'attempted'
    }));
    setBestScores(prev => ({
      ...prev,
      [questionIndex]: { passed, total }
    }));
  }, []);

  // Handle console resize
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !consoleRef.current) return;
    const container = consoleRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const newHeight = containerRect.bottom - e.clientY;
    const minHeight = 100;
    const maxHeight = containerRect.height * 0.6;
    const clampedHeight = Math.min(Math.max(newHeight, minHeight), maxHeight);
    setConsoleHeight(clampedHeight);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleRun = async () => {
    const questionId = getCurrentQuestionId();
    if (running || !questionId) return;
    setRunning(true);
    setShowOutput(true);
    setTestResults(null);
    setOutput(null);

    try {
      const response = await fetch(`${URLs.EXECUTE}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, questionId })
      });

      const data = await response.json();
      if (response.ok) {
        setTestResults(data.results);
        setOutput({ summary: data.summary });
      } else {
        setOutput({ error: data.message || 'Failed to run code' });
      }
    } catch (err) {
      setOutput({ error: 'Failed to connect to server' });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    const questionId = getCurrentQuestionId();
    if (running || !questionId) return;
    setRunning(true);
    setShowOutput(true);
    setTestResults(null);
    setOutput(null);

    try {
      const response = await fetch(`${URLs.EXECUTE}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, questionId: getCurrentQuestionId() })
      });

      const data = await response.json();
      if (response.ok) {
        setTestResults(data.results);
        const isAccepted = data.summary?.passed === data.summary?.total;
        setOutput({
          summary: data.summary,
          isAccepted: isAccepted,
          message: isAccepted ? 'All test cases passed!' : `${data.summary.passed}/${data.summary.total} test cases passed`
        });

        // Update question status after submission
        if (data.summary) {
          updateQuestionStatus(currentQuestionIndex, data.summary.passed, data.summary.total);
        }

        // Also save to backend with questionIndex
        try {
          await fetch(`${API_URL}/token/${encodeURIComponent(token)}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              submittedCode: code,
              language,
              questionIndex: currentQuestionIndex,
              testSummary: data.summary,
              executionResults: data.results
            })
          });
        } catch (saveErr) {
          console.error('Failed to save submission:', saveErr);
        }
      } else {
        setOutput({ error: data.message || 'Failed to submit' });
      }
    } catch (err) {
      setOutput({ error: 'Failed to connect to server' });
    } finally {
      setRunning(false);
    }
  };

  // Handle finish interview - submit current code and complete interview
  const handleFinishInterview = async () => {
    if (interviewCompleted || running) return;

    // Validate that we have question data
    if (!getCurrentQuestionId()) {
      alert('Error: No question loaded. Please refresh the page and try again.');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to finish the interview? This will submit your current code and end the interview.');
    if (!confirmed) return;

    setRunning(true);

    try {
      console.log('Starting finish process...');
      console.log('Question ID:', getCurrentQuestionId());
      console.log('Token:', token);

      // First try to submit current code to get results
      let testSummary = null;
      let executionResults = [];

      try {
        const execResponse = await fetch(`${URLs.EXECUTE}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language, questionId: getCurrentQuestionId() })
        });

        if (execResponse.ok) {
          const execData = await execResponse.json();
          testSummary = execData.summary;
          executionResults = execData.results || [];
          console.log('Execution results:', testSummary);

          // Update question status
          if (testSummary) {
            updateQuestionStatus(currentQuestionIndex, testSummary.passed, testSummary.total);
          }
        } else {
          console.warn('Execution failed, continuing with empty results:', execResponse.status);
        }
      } catch (execError) {
        console.warn('Execution error (continuing anyway):', execError.message);
      }

      console.log('Calling finish endpoint...');

      // Now finish the interview
      const finishResponse = await fetch(`${API_URL}/token/${encodeURIComponent(token)}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submittedCode: code,
          language,
          questionIndex: currentQuestionIndex,
          testSummary: testSummary,
          executionResults: executionResults,
          completionType: 'manual'
        })
      });

      console.log('Finish response status:', finishResponse.status);

      if (!finishResponse.ok) {
        const errorData = await finishResponse.json();
        console.error('Finish error:', errorData);
        alert(errorData.message || 'Failed to complete interview');
        setRunning(false);
        return;
      }

      const finishData = await finishResponse.json();
      console.log('Finish success:', finishData);

      setInterviewCompleted(true);
      setInterview(finishData.interview);
      // Navigate to completion page
      navigate(`/interview/${token}/complete`, {
        state: { interview: finishData.interview, isAutoSubmit: false }
      });
    } catch (err) {
      console.error('Error finishing interview:', err);
      alert('Failed to complete interview: ' + err.message);
    } finally {
      setRunning(false);
    }
  };

  // Helper to get current question ID safely
  const getCurrentQuestionId = () => {
    if (!question) return null;
    // Handle both _id and id fields
    return question._id || question.id;
  };

  // Run button - executes first 3 test cases only

  const getFileExtension = () => {
    switch (language) {
      case 'javascript': return 'js';
      case 'python': return 'py';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'txt';
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
      <header className="coding-header">
        <div className="header-left">
          {questions.length > 1 ? (
            <>
              <div className="question-navigator">
                <button
                  className="nav-arrow"
                  onClick={() => {
                    const idx = currentQuestionIndex > 0 ? currentQuestionIndex - 1 : questions.length - 1;
                    setCurrentQuestionIndex(idx);
                    setQuestion(questions[idx]);
                    setOutput(null);
                    setTestResults(null);
                  }}
                  title="Previous Question"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M9.78 12.78a.75.75 0 01-1.06 0L4.47 8.53a.75.75 0 010-1.06l4.25-4.25a.751.751 0 011.042.018.751.751 0 01.018 1.042L6.06 8l3.72 3.72a.75.75 0 010 1.06z"/>
                  </svg>
                </button>
                <select
                  className="question-nav-select"
                  value={currentQuestionIndex}
                  onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    setCurrentQuestionIndex(idx);
                    setQuestion(questions[idx]);
                    setOutput(null);
                    setTestResults(null);
                  }}
                >
                  {questions.map((q, idx) => {
                    const status = questionStatuses[idx];
                    const bestScore = bestScores[idx];
                    return (
                      <option key={idx} value={idx}>
                        {idx + 1}. {q?.title || `Question ${idx + 1}`}
                        {status === 'accepted' && ' ✓'}
                        {status === 'attempted' && ` (${bestScore?.passed || 0}/${bestScore?.total || 0})`}
                      </option>
                    );
                  })}
                </select>
                <span className="question-count">{currentQuestionIndex + 1} / {questions.length}</span>
                <button
                  className="nav-arrow"
                  onClick={() => {
                    const idx = currentQuestionIndex < questions.length - 1 ? currentQuestionIndex + 1 : 0;
                    setCurrentQuestionIndex(idx);
                    setQuestion(questions[idx]);
                    setOutput(null);
                    setTestResults(null);
                  }}
                  title="Next Question"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.751.751 0 01-1.042-.018.751.751 0 01-.018-1.042L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/>
                  </svg>
                </button>
              </div>
              {/* Status tag - outside navigator, Codeforces style */}
              {questionStatuses[currentQuestionIndex] && (
                <span className={`status-tag ${questionStatuses[currentQuestionIndex]}`}>
                  {questionStatuses[currentQuestionIndex] === 'accepted' ? 'Accepted' : 'Attempted'}
                </span>
              )}
            </>
          ) : (
            <span className="interview-title">{question?.title || interview?.questionTitle || 'Problem'}</span>
          )}
        </div>
        <div className="header-center">
          <div className={`timer ${isTimeLow ? 'timer-low' : ''}`}>
            <span className="timer-icon">⏱</span>
            <span className="timer-time">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <div className="header-right">
          <select className="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
          </select>
          <button className="run-btn" onClick={handleRun} disabled={running}>
            {running ? 'Running...' : 'Run'}
          </button>
          <button className="submit-btn" onClick={handleSubmit} disabled={running}>
            {running ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="coding-main">
        {/* Left Panel - Question */}
        <section className="question-panel">
          <div className="question-content">
            <h2 className="question-title">
              {questions.length > 1 && (currentQuestionIndex + 1)}.
              {question?.title || interview?.questionTitle || 'Problem'}
            </h2>

            <h3>Description</h3>
            <p className="question-description">{question?.description || 'No description available'}</p>

            {question?.testCases && question.testCases.length > 0 && (
              <div className="examples-section">
                <h3>Examples</h3>
                {question.testCases.slice(0, 3).map((testCase, index) => (
                  <div key={index} className="example-box">
                    <p><strong>Example {index + 1}:</strong></p>
                    <div className="example-content">
                      <div className="example-row">
                        <span className="example-label">Input:</span>
                        <span className="example-value">{testCase.input}</span>
                      </div>
                      <div className="example-row">
                        <span className="example-label">Output:</span>
                        <span className="example-value">{testCase.output}</span>
                      </div>
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
        </section>

        {/* Right Panel - Code Editor */}
        <section className="code-panel" ref={consoleRef}>
          {/* Editor Section */}
          <div className="editor-section" style={{ flex: showOutput ? '1 1 auto' : '1 1 100%' }}>
            <div className="editor-header">
              <div className="editor-actions">
                <button className={`toggle-btn ${showOutput ? 'active' : ''}`} onClick={() => setShowOutput(!showOutput)}>
                  {showOutput ? '▼ Console' : '▲ Console'}
                </button>
              </div>
            </div>
            <div className="code-editor-wrapper">
              <CodeEditor language={language} code={code} onChange={setCode} />
            </div>
          </div>

          {/* Resize Handle */}
          {showOutput && (
            <div className={`resize-handle ${isDragging ? 'dragging' : ''}`} onMouseDown={handleMouseDown}>
              <div className="resize-line"></div>
            </div>
          )}

          {/* Output Panel */}
          {showOutput && (
            <div className="output-section" style={{ height: consoleHeight }}>
              <div className="console-header">
                <span>Test Results</span>
                {testResults && output?.summary && (
                  <span className={`console-status ${output.summary.status}`}>
                    {output.summary.passed}/{output.summary.total} Passed
                  </span>
                )}
              </div>
              <div className="console-body">
                {output?.error ? (
                  <div className="console-error">
                    <span className="error-icon">⚠</span>
                    <span className="error-message">{output.error}</span>
                  </div>
                ) : testResults && testResults.length > 0 ? (
                  <div className="console-results">
                    {testResults.map((result, index) => (
                      <div key={index} className={`result-item ${result.passed ? 'passed' : 'failed'}`}>
                        <div className="result-header">
                          <span className={`result-icon ${result.passed ? 'pass' : 'fail'}`}>
                            {result.passed ? '✓' : '✗'}
                          </span>
                          <span className="result-title">Test Case {index + 1}</span>
                          <span className={`result-status ${result.passed ? 'pass' : 'fail'}`}>
                            {result.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        <div className="result-details">
                          <div className="result-row">
                            <span className="result-label">Input:</span>
                            <code>{result.input || 'N/A'}</code>
                          </div>
                          <div className="result-row">
                            <span className="result-label">Expected:</span>
                            <code className="correct">{result.expected || 'N/A'}</code>
                          </div>
                          <div className="result-row">
                            <span className="result-label">Output:</span>
                            <code className={result.passed ? 'correct' : 'incorrect'}>
                              {result.error ? result.error : (result.actual || 'N/A')}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className={`summary-bar ${output.summary.status} ${output.isAccepted ? 'accepted' : ''}`}>
                      <span className="summary-icon">
                        {output.isAccepted ? '✅' : output.summary.status === 'partial' ? '⚠️' : '❌'}
                      </span>
                      <span className="summary-text">
                        {output.isAccepted
                          ? 'Accepted - All test cases passed!'
                          : `${output.summary.passed}/${output.summary.total} test cases passed`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="console-placeholder">
                    <span className="placeholder-icon">▶</span>
                    <span>Run your code to see test results here.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
