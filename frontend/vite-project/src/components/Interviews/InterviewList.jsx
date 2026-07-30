import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviews } from '../../context/InterviewContext';
import './InterviewList.css';

export default function InterviewList() {
  const navigate = useNavigate();
  const { interviews, deleteInterview, loading } = useInterviews();
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the interview with "${name}"?`)) {
      await deleteInterview(id);
    }
  };

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
      default: return status;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Get questions display text
  const getQuestionsText = (interview) => {
    if (interview.questions && interview.questions.length > 0) {
      return interview.questions.length > 1
        ? `${interview.questions[0]?.questionTitle || 'Question'} (+${interview.questions.length - 1} more)`
        : interview.questions[0]?.questionTitle || interview.questionTitle;
    }
    return interview.questionTitle || 'N/A';
  };

  return (
    <div className="interview-list-container">
      <div className="list-header">
        <h2>Interviews</h2>
        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={handleRefresh}
          >
            ↻ Refresh
          </button>
          <button
            className="create-btn"
            onClick={() => navigate('/admin/interviews/new')}
          >
            + Schedule Interview
          </button>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div className="empty-state">
          <p>No interviews scheduled. Schedule your first interview!</p>
        </div>
      ) : (
        <table className="interview-table">
          <thead>
            <tr>
              <th>Question</th>
              <th>Interviewee</th>
              <th>Scheduled</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((interview) => (
              <tr key={interview._id}>
                <td className="title-cell">{getQuestionsText(interview)}</td>
                <td>
                  <div className="interviewee-info">
                    <span className="name">{interview.intervieweeName}</span>
                    <span className="email">{interview.intervieweeEmail}</span>
                  </div>
                </td>
                <td className="date-cell">
                  {interview.scheduledAt ? formatDateTime(interview.scheduledAt) : 'N/A'}
                </td>
                <td className="duration-cell">{interview.duration} min</td>
                <td>
                  <span className={`status-badge ${getStatusClass(interview.status)}`}>
                    {formatStatus(interview.status)}
                  </span>
                </td>
                <td className="actions-cell">
                  {(interview.status === 'completed' || interview.status === 'in-progress') && (
                    <button
                      className="results-btn"
                      onClick={() => handleViewResults(interview)}
                    >
                      {interview.status === 'completed' ? 'Results' : 'View Progress'}
                    </button>
                  )}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(interview._id, interview.intervieweeName)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  <span className="label">Interviewee:</span>
                  <span className="value">{selectedInterview.intervieweeName}</span>
                </div>
                <div className="result-item">
                  <span className="label">Email:</span>
                  <span className="value">{selectedInterview.intervieweeEmail}</span>
                </div>
                <div className="result-item">
                  <span className="label">Status:</span>
                  <span className={`value status-badge ${getStatusClass(selectedInterview.status)}`}>
                    {formatStatus(selectedInterview.status)}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Started:</span>
                  <span className="value">
                    {selectedInterview.startedAt ? formatDateTime(selectedInterview.startedAt) : 'Not started'}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Completed:</span>
                  <span className="value">
                    {selectedInterview.completedAt ? formatDateTime(selectedInterview.completedAt) : 'Not completed'}
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Completion Type:</span>
                  <span className="value">{selectedInterview.completionType || 'N/A'}</span>
                </div>
              </div>

              <h4>Question Results</h4>

              {/* Show assigned questions from the interview */}
              {selectedInterview.questions && selectedInterview.questions.length > 0 ? (
                <div className="question-results">
                  {selectedInterview.questions.map((q, idx) => {
                    // Find best score for this question
                    const bestScore = selectedInterview.bestScores?.find(
                      bs => bs.questionId?.toString() === q.questionId?.toString() ||
                            bs.questionId === q.questionId
                    );
                    // Find submissions for this question
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
                            {isAccepted ? '✓ Accepted' : hasSubmissions ? `${passed}/${total}` : 'Not attempted'}
                          </span>
                        </div>
                        <div className="question-result-details">
                          <span className="submits-count">Submissions: {submissions.length}</span>
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
                            {isAccepted ? '✓ Accepted' : `${bs.passed}/${bs.total}`}
                          </span>
                        </div>
                        <div className="question-result-details">
                          <span className="submits-count">Submissions: {submissions.length}</span>
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