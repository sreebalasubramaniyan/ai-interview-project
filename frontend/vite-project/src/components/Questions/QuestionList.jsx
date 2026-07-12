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
        <h2>Questions</h2>
        <button
          className="create-btn"
          onClick={() => navigate('/admin/questions/new')}
        >
          + Create Question
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="empty-state">
          <p>No questions yet. Create your first question!</p>
        </div>
      ) : (
        <table className="question-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Test Cases</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question._id}>
                <td className="title-cell">{question.title}</td>
                <td>
                  <span className={`difficulty-badge ${getDifficultyClass(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                </td>
                <td className="count-cell">{question.testCases?.length || 0}</td>
                <td className="date-cell">
                  {question.createdAt ? new Date(question.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="actions-cell">
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(question._id, question.title)}
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