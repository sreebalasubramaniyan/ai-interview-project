import { useNavigate } from 'react-router-dom';
import { useQuestions } from '../../context/QuestionContext';
import './QuestionList.css';

export default function QuestionList() {
  const navigate = useNavigate();
  const { questions, deleteQuestion, loading } = useQuestions();

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteQuestion(id);
    }
  };

  const handleEdit = (question) => {
    navigate(`/admin/questions/edit/${question._id}`);
  };

  const getDifficultyClass = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'easy';
      case 'Medium': return 'medium';
      case 'Hard': return 'hard';
      default: return '';
    }
  };

  return (
    <div className="question-list-container">
      <div className="list-header">
        <div className="header-title">
          <h2>Questions</h2>
          <span className="count-badge">{questions.length}</span>
        </div>
        <button
          className="create-btn"
          onClick={() => navigate('/admin/questions/new')}
        >
          + Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <p>No questions yet</p>
          <span>Create your first question to get started</span>
        </div>
      ) : (
        <div className="questions-grid">
          {questions.map((question) => (
            <div key={question._id} className="question-card">
              <div className="card-header">
                <h3 className="question-title">{question.title}</h3>
                <span className={`difficulty-badge ${getDifficultyClass(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>

              <div className="card-meta">
                <div className="meta-item">
                  <span className="meta-label">Test Cases</span>
                  <span className="meta-value">{question.testCases?.length || 0}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Created</span>
                  <span className="meta-value">
                    {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(question)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(question._id, question.title)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
