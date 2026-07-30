// API Configuration
// Use environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_URL = {
  INTERVIEW: `${API_BASE_URL}/interviews`,
  QUESTIONS: `${API_BASE_URL}/questions`,
  EXECUTE: `${API_BASE_URL}/execute`,
  BASE: API_BASE_URL
};

export default API_URL;
