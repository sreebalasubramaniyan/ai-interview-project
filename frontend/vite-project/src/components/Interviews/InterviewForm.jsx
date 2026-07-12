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
    questionId: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedQuestion = questions.find(q => q._id === formData.questionId);

    const interviewData = {
      questionId: formData.questionId,
      questionTitle: selectedQuestion?.title || '',
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
          <label>Select Question</label>
          <select
            name="questionId"
            value={formData.questionId}
            onChange={handleChange}
            required
          >
            <option value="">Choose a question...</option>
            {questions.map(q => (
              <option key={q._id} value={q._id}>
                {q.title} ({q.difficulty})
              </option>
            ))}
          </select>
        </div>

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
            min="15"
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