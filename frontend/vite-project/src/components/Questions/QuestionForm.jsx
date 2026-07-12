import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestions } from '../../context/QuestionContext';
import './QuestionForm.css';

export default function QuestionForm() {
  const navigate = useNavigate();
  const { addQuestion, loading } = useQuestions();

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    description: '',
    constraints: '',
    testCases: [{ input: '', output: '' }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index] = { ...newTestCases[index], [field]: value };
    setFormData(prev => ({ ...prev, testCases: newTestCases }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', output: '' }]
    }));
  };

  const removeTestCase = (index) => {
    if (formData.testCases.length > 1) {
      const newTestCases = formData.testCases.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, testCases: newTestCases }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const questionData = {
      title: formData.title,
      difficulty: formData.difficulty,
      description: formData.description,
      constraints: formData.constraints.split('\n').filter(c => c.trim()),
      testCases: formData.testCases.filter(tc => tc.input && tc.output)
    };

    await addQuestion(questionData);
    navigate('/admin/questions');
  };

  return (
    <div className="question-form-container">
      <h2>Create New Question</h2>
      <form onSubmit={handleSubmit} className="question-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Two Sum"
            required
          />
        </div>

        <div className="form-group">
          <label>Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the problem..."
            rows={6}
            required
          />
        </div>

        <div className="form-group">
          <label>Constraints</label>
          <textarea
            name="constraints"
            value={formData.constraints}
            onChange={handleChange}
            placeholder="Enter each constraint on a new line&#10;e.g.,&#10;2 <= nums.length <= 10^4&#10;-10^9 <= nums[i] <= 10^9"
            rows={4}
          />
          <span className="help-text">One constraint per line</span>
        </div>

        <div className="form-group">
          <label>Sample Test Cases</label>
          <div className="test-cases">
            {formData.testCases.map((tc, index) => (
              <div key={index} className="test-case-row">
                <div className="test-case-field">
                  <span>Input</span>
                  <input
                    type="text"
                    value={tc.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    placeholder="e.g., nums = [2,7,11,15], target = 9"
                  />
                </div>
                <div className="test-case-field">
                  <span>Output</span>
                  <input
                    type="text"
                    value={tc.output}
                    onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                    placeholder="e.g., [0,1]"
                  />
                </div>
                {formData.testCases.length > 1 && (
                  <button
                    type="button"
                    className="remove-test-case"
                    onClick={() => removeTestCase(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="add-test-case" onClick={addTestCase}>
            + Add Test Case
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Question'}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/admin/questions')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}