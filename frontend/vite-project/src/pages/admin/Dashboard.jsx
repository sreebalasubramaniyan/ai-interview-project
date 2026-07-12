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
    { label: 'Total Questions', value: totalQuestions, color: '#3b82f6' },
    { label: 'Total Interviews', value: totalInterviews, color: '#8b5cf6' },
    { label: 'Pending', value: pendingInterviews, color: '#f59e0b' },
    { label: 'Completed', value: completedInterviews, color: '#10b981' }
  ];

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="recent-section">
        <h3>Recent Questions</h3>
        <div className="recent-list">
          {questions.slice(0, 5).map(q => (
            <div key={q._id} className="recent-item">
              <span className="title">{q.title}</span>
              <span className={`difficulty ${q.difficulty?.toLowerCase() || 'easy'}`}>
                {q.difficulty}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}