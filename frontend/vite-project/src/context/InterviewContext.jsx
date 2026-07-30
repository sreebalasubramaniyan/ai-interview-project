import { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '../config';

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all interviews on mount and set up polling for updates
  useEffect(() => {
    fetchInterviews();

    // Poll for updates every 10 seconds to catch interview completions
    const interval = setInterval(() => {
      fetchInterviews();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/interviews`);
      if (!response.ok) throw new Error('Failed to fetch interviews');
      const data = await response.json();
      setInterviews(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const scheduleInterview = async (interview) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interview)
      });
      if (!response.ok) throw new Error('Failed to schedule interview');
      const newInterview = await response.json();
      setInterviews(prev => [newInterview, ...prev]);
      return newInterview;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateInterview = async (id, updates) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/interviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update interview');
      const updated = await response.json();
      setInterviews(prev => prev.map(i => i._id === id ? updated : i));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteInterview = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/interviews/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete interview');
      setInterviews(prev => prev.filter(i => i._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInterviewById = (id) => {
    return interviews.find(i => i._id === id);
  };

  return (
    <InterviewContext.Provider value={{
      interviews,
      loading,
      error,
      scheduleInterview,
      updateInterview,
      deleteInterview,
      getInterviewById,
      fetchInterviews
    }}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterviews() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterviews must be used within InterviewProvider');
  }
  return context;
}