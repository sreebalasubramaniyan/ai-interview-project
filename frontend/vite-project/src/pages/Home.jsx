import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { login, register, loading, admin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    if (admin) {
      navigate('/admin');
    }
  }, [admin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let result;
    if (isRegister) {
      result = await register(name, email, password);
    } else {
      result = await login(email, password);
    }

    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
  };

  const steps = [
    { num: '01', title: 'Create Questions', desc: 'Add coding questions with test cases' },
    { num: '02', title: 'Schedule Interview', desc: 'Invite candidates via email' },
    { num: '03', title: 'Candidate Codes', desc: 'Solve questions in timed session' },
    { num: '04', title: 'View Results', desc: 'Get automated scores instantly' }
  ];

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-logo">
          <div className="logo-square">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 5L6 12l6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="logo-text"> InterviewPro</span>
        </div>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          )}
        </button>
      </header>

      <main className="home-main">
        <div className="home-content">
          <div className="hero-section">
            <h1 className="hero-title">
              Technical interviews,<br/>
              <span className="highlight">made simple</span>
            </h1>
            <p className="hero-subtitle">
              Streamline your hiring process with automated coding assessments.
              Create questions, schedule candidates, and evaluate solutions with instant feedback.
            </p>

            <div className="steps-grid">
              {steps.map((step, index) => (
                <div key={index} className="step-item">
                  <span className="step-num">{step.num}</span>
                  <div className="step-text">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="login-section">
            <div className="login-card">
              <div className="login-header">
                <div className="login-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/>
                  </svg>
                </div>
                <h2>{isRegister ? 'Create an account' : 'Sign in to your account'}</h2>
                <p>{isRegister ? 'Enter your details to get started' : 'Enter your credentials to continue'}</p>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {error && <div className="login-error">{error}</div>}

                {isRegister && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Continue'}
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </button>
              </form>

              <div className="login-toggle">
                <p>
                  {isRegister ? 'Already have an account?' : "Don't have an account?"}
                  <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                    {isRegister ? ' Sign in' : ' Register'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>© 2024 InterviewPro. All rights reserved.</p>
      </footer>
    </div>
  );
}
