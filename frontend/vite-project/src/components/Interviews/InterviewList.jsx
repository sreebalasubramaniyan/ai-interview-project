import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviews } from '../../context/InterviewContext';
import './InterviewList.css';

export default function InterviewList() {
  const navigate = useNavigate();
  const { interviews, loading } = useInterviews();
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const handleViewResults = (interview) => {
    setSelectedInterview(interview);
    setShowResultsModal(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'in-progress': return 'in-progress';
      case 'completed': return 'completed';
      case 'expired': return 'expired';
      default: return '';
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'in-progress': return 'In Progress';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuestionsText = (interview) => {
    if (interview.questions && interview.questions.length > 0) {
      return interview.questions.length > 1
        ? `${interview.questions.length} Questions`
        : interview.questions[0]?.questionTitle || interview.questionTitle;
    }
    return interview.questionTitle || 'N/A';
  };

  return (
    <div className="interview-list-container">
      <div className="list-header">
        <div className="header-title">
          <h2>Interviews</h2>
          <span className="count-badge">{interviews.length}</span>
        </div>
        <div className="header-actions">
          <button className="create-btn" onClick={() => navigate('/admin/interviews/new')}>
            + Schedule Interview
          </button>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <p>No interviews scheduled</p>
          <span>Schedule your first interview to get started</span>
        </div>
      ) : (
        <div className="interviews-grid">
          {interviews.map((interview) => (
            <div key={interview._id} className="interview-card">
              <div className="card-header">
                <div className="candidate-info">
                  <h3>{interview.intervieweeName}</h3>
                  <span className="email">{interview.intervieweeEmail}</span>
                </div>
                <span className={`status-badge ${getStatusClass(interview.status)}`}>
                  {formatStatus(interview.status)}
                </span>
              </div>

              <div className="card-details">
                <div className="detail-item">
                  <span className="detail-label">Questions</span>
                  <span className="detail-value">{getQuestionsText(interview)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Scheduled</span>
                  <span className="detail-value">
                    {interview.scheduledAt ? formatDateTime(interview.scheduledAt) : 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{interview.duration} min</span>
                </div>
              </div>

              {(interview.status === 'completed' || interview.status === 'in-progress') && (
                <div className="card-actions">
                  <button
                    className="results-btn"
                    onClick={() => handleViewResults(interview)}
                  >
                    {interview.status === 'completed' ? 'View Results' : 'View Progress'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && selectedInterview && (
        <div className="modal-overlay" onClick={() => setShowResultsModal(false)}>
          <div className="modal-content results-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Interview Results</h3>
              <button className="modal-close" onClick={() => setShowResultsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="result-summary">
                <div className="result-item">
                  <span className="label">Candidate</span>
                  <span className="value">{selectedInterview.intervieweeName}</span>
                </div>
                <div className="result-item">
                  <span className="label">Email</span>
                  <span className="value">{selectedInterview.intervieweeEmail}</span>
                </div>
                <div className="result-item">
                  <span className="label">Status</span>
                  <span className={`value status-badge ${getStatusClass(selectedInterview.status)}`}>
                    {formatStatus(selectedInterview.status)}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Started</span>
                  <span className="value">
                    {selectedInterview.startedAt ? formatDateTime(selectedInterview.startedAt) : 'Not started'}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Completed</span>
                  <span className="value">
                    {selectedInterview.completedAt ? formatDateTime(selectedInterview.completedAt) : 'Not completed'}
                  </span>
                </div>
              </div>

              <h4>Question Results</h4>

              {selectedInterview.questions && selectedInterview.questions.length > 0 ? (
                <div className="question-results">
                  {selectedInterview.questions.map((q, idx) => {
                    const bestScore = selectedInterview.bestScores?.find(
                      bs => bs.questionId?.toString() === q.questionId?.toString() ||
                            bs.questionId === q.questionId
                    );
                    const submissions = selectedInterview.allSubmissions?.filter(
                      s => s.questionId?.toString() === q.questionId?.toString() ||
                           s.questionId === q.questionId
                    ) || [];

                    const passed = bestScore?.passed || 0;
                    const total = bestScore?.total || 0;
                    const isAccepted = passed === total && total > 0;
                    const hasSubmissions = submissions.length > 0;

                    return (
                      <div key={idx} className={`question-result-card ${isAccepted ? 'accepted' : hasSubmissions ? 'partial' : 'not-attempted'}`}>
                        <div className="question-result-header">
                          <span className="question-title">{q.questionTitle || `Question ${idx + 1}`}</span>
                          <span className={`score-badge ${isAccepted ? 'accepted' : hasSubmissions ? 'partial' : 'not-attempted'}`}>
                            {isAccepted ? '✓ Passed' : hasSubmissions ? `${passed}/${total}` : 'Not attempted'}
                          </span>
                        </div>
                        {hasSubmissions && (
                          <div className="submission-code">
                            <details>
                              <summary>View Code ({submissions[submissions.length - 1]?.language})</summary>
                              <pre>{submissions[submissions.length - 1]?.submittedCode}</pre>
                            </details>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : selectedInterview.bestScores && selectedInterview.bestScores.length > 0 ? (
                <div className="question-results">
                  {selectedInterview.bestScores.map((bs, idx) => {
                    const submissions = selectedInterview.allSubmissions?.filter(
                      s => s.questionId?.toString() === bs.questionId?.toString() ||
                           s.questionId === bs.questionId
                    ) || [];
                    const isAccepted = bs.passed === bs.total;

                    return (
                      <div key={idx} className={`question-result-card ${isAccepted ? 'accepted' : 'partial'}`}>
                        <div className="question-result-header">
                          <span className="question-title">{bs.questionTitle}</span>
                          <span className={`score-badge ${isAccepted ? 'accepted' : 'partial'}`}>
                            {isAccepted ? '✓ Passed' : `${bs.passed}/${bs.total}`}
                          </span>
                        </div>
                        {submissions.length > 0 && (
                          <div className="submission-code">
                            <details>
                              <summary>View Code ({submissions[submissions.length - 1]?.language})</summary>
                              <pre>{submissions[submissions.length - 1]?.submittedCode}</pre>
                            </details>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-results">No submission results available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
