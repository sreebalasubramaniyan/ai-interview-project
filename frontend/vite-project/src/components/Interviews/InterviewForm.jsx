import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestions } from '../../context/QuestionContext';
import { useInterviews } from '../../context/InterviewContext';
import './InterviewForm.css';

export default function InterviewForm() {
  const navigate = useNavigate();
  const { questions } = useQuestions();
  const { scheduleInterview, loading } = useInterviews();

  const [formData, setFormData] = useState({
    questionIds: [],
    intervieweeName: '',
    intervieweeEmail: '',
    date: '',
    time: '',
    duration: 60
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionToggle = (questionId) => {
    setFormData(prev => {
      const currentIds = prev.questionIds || [];
      if (currentIds.includes(questionId)) {
        return { ...prev, questionIds: currentIds.filter(id => id !== questionId) };
      } else {
        return { ...prev, questionIds: [...currentIds, questionId] };
      }
    });
  };

  const handleMoveQuestion = (questionId, direction) => {
    setFormData(prev => {
      const currentIds = [...(prev.questionIds || [])];
      const index = currentIds.indexOf(questionId);
      if (direction === 'up' && index > 0) {
        [currentIds[index - 1], currentIds[index]] = [currentIds[index], currentIds[index - 1]];
      } else if (direction === 'down' && index < currentIds.length - 1) {
        [currentIds[index], currentIds[index + 1]] = [currentIds[index + 1], currentIds[index]];
      }
      return { ...prev, questionIds: currentIds };
    });
  };

  const selectedQuestions = formData.questionIds.map(id => {
    const q = questions.find(question => question._id === id);
    return { id, title: q?.title || 'Unknown', difficulty: q?.difficulty || 'Easy' };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const interviewData = {
      questionIds: formData.questionIds,
      intervieweeName: formData.intervieweeName,
      intervieweeEmail: formData.intervieweeEmail,
      scheduledAt: new Date(`${formData.date}T${formData.time}`).toISOString(),
      duration: parseInt(formData.duration)
    };

    await scheduleInterview(interviewData);
    navigate('/admin/interviews');
  };

  return (
    <div className="interview-form-container">
      <h2>Schedule New Interview</h2>
      <form onSubmit={handleSubmit} className="interview-form">
        <div className="form-group">
          <label>Select Questions (select multiple)</label>
          <div className="question-select-grid">
            {questions.map(q => (
              <div
                key={q._id}
                className={`question-select-card ${formData.questionIds.includes(q._id) ? 'selected' : ''}`}
                onClick={() => handleQuestionToggle(q._id)}
              >
                <div className="question-checkbox">
                  {formData.questionIds.includes(q._id) && <span>✓</span>}
                </div>
                <div className="question-info">
                  <span className="question-title">{q.title}</span>
                  <span className={`difficulty-badge ${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedQuestions.length > 0 && (
          <div className="form-group">
            <label>Selected Questions (in order)</label>
            <div className="selected-questions-list">
              {selectedQuestions.map((q, index) => (
                <div key={q.id} className="selected-question-item">
                  <span className="question-order">{index + 1}</span>
                  <span className="question-title">{q.title}</span>
                  <div className="question-order-buttons">
                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(q.id, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(q.id, 'down')}
                      disabled={index === selectedQuestions.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Interviewee Name</label>
          <input
            type="text"
            name="intervieweeName"
            value={formData.intervieweeName}
            onChange={handleChange}
            placeholder="Enter candidate's name"
            required
          />
        </div>

        <div className="form-group">
          <label>Interviewee Email</label>
          <input
            type="email"
            name="intervieweeEmail"
            value={formData.intervieweeEmail}
            onChange={handleChange}
            placeholder="candidate@email.com"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="180"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Scheduling...' : 'Schedule Interview'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/admin/interviews')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}