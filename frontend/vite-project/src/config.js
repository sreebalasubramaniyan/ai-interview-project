// API Configuration
// Use environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Export as string (for ${API_URL}/endpoint usage)
export default API_BASE_URL;

// Also export object for specific endpoints
export const API_URL = {
  INTERVIEW: `${API_BASE_URL}/interviews`,
  QUESTIONS: `${API_BASE_URL}/questions`,
  EXECUTE: `${API_BASE_URL}/execute`,
  BASE: API_BASE_URL
};
