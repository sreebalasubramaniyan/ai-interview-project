import { useQuestions } from '../../context/QuestionContext';
import { useInterviews } from '../../context/InterviewContext';
import './Dashboard.css';

export default function Dashboard() {
  const { questions } = useQuestions();
  const { interviews } = useInterviews();

  const totalQuestions = questions.length;
  const totalInterviews = interviews.length;
  const pendingInterviews = interviews.filter(i => i.status === 'pending').length;
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;

  const stats = [
    {
      label: 'Total Questions',
      value: totalQuestions,
      color: 'blue',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      )
    },
    {
      label: 'Total Interviews',
      value: totalInterviews,
      color: 'purple',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      )
    },
    {
      label: 'Pending',
      value: pendingInterviews,
      color: 'amber',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
      )
    },
    {
      label: 'Completed',
      value: completedInterviews,
      color: 'green',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22,4 12,14.01 9,11.01"/>
        </svg>
      )
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome back</h2>
        <p>Here's what's happening with your interviews today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>
              {stat.icon}
            </div>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Questions</h3>
            <a href="/admin/questions">View all</a>
          </div>
          <div className="card-body">
            <ul className="recent-list">
              {questions.slice(0, 5).map(q => (
                <li key={q._id} className="recent-item">
                  <span className="title">{q.title}</span>
                  <span className={`difficulty ${q.difficulty?.toLowerCase() || 'easy'}`}>
                    {q.difficulty}
                  </span>
                </li>
              ))}
              {questions.length === 0 && (
                <li className="recent-item">
                  <span className="title" style={{ color: '#9ca3af' }}>No questions yet</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="card-body">
            <ul className="activity-list">
              {interviews.slice(0, 5).map(i => (
                <li key={i._id} className="activity-item">
                  <div className={`activity-dot ${i.status === 'completed' ? 'green' : i.status === 'pending' ? 'amber' : 'purple'}`}></div>
                  <div className="activity-content">
                    <p className="activity-text">
                      <strong>{i.intervieweeName}</strong> - {i.status}
                    </p>
                    <span className="activity-time">
                      {i.scheduledAt ? new Date(i.scheduledAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </li>
              ))}
              {interviews.length === 0 && (
                <li className="activity-item">
                  <div className="activity-content">
                    <p className="activity-text" style={{ color: '#9ca3af' }}>No recent activity</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
