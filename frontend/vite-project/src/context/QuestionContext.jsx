import { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

const QuestionContext = createContext(null);

export function QuestionProvider({ children }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all questions on mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/questions`);
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (question) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question)
      });
      if (!response.ok) throw new Error('Failed to create question');
      const newQuestion = await response.json();
      setQuestions(prev => [newQuestion, ...prev]);
      return newQuestion;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (id, updates) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update question');
      const updated = await response.json();
      setQuestions(prev => prev.map(q => q._id === id ? updated : q));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/questions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete question');
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getQuestionById = (id) => {
    return questions.find(q => q._id === id);
  };

  return (
    <QuestionContext.Provider value={{
      questions,
      loading,
      error,
      addQuestion,
      updateQuestion,
      deleteQuestion,
      getQuestionById,
      fetchQuestions
    }}>
      {children}
    </QuestionContext.Provider>
  );
}

export function useQuestions() {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error('useQuestions must be used within QuestionProvider');
  }
  return context;
}