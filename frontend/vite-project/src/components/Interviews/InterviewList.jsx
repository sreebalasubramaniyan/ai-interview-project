import { useNavigate } from 'react-router-dom';
import { useInterviews } from '../../context/InterviewContext';
import './InterviewList.css';

export default function InterviewList() {
  const navigate = useNavigate();
  const { interviews, deleteInterview, loading } = useInterviews();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the interview with "${name}"?`)) {
      await deleteInterview(id);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'completed': return 'completed';
      case 'expired': return 'expired';
      default: return '';
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="interview-list-container">
      <div className="list-header">
        <h2>Interviews</h2>
        <button
          className="create-btn"
          onClick={() => navigate('/admin/interviews/new')}
        >
          + Schedule Interview
        </button>
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
                <td className="title-cell">{interview.questionTitle}</td>
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
                    {interview.status}
                  </span>
                </td>
                <td className="actions-cell">
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
    </div>
  );
}