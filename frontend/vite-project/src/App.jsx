import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuestionProvider } from './context/QuestionContext';
import { InterviewProvider } from './context/InterviewContext';

// Pages
import Home from './pages/Home';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import QuestionsPage from './pages/admin/QuestionsPage';
import NewQuestionPage from './pages/admin/NewQuestionPage';
import InterviewsPage from './pages/admin/InterviewsPage';
import NewInterviewPage from './pages/admin/NewInterviewPage';
import IntervieweeLogin from './pages/interview/IntervieweeLogin';
import IntervieweeDashboard from './pages/interview/IntervieweeDashboard';
import CompletionScreen from './pages/interview/CompletionScreen';

// Layout
import AdminLayout from './components/Layout/AdminLayout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuestionProvider>
          <InterviewProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="questions" element={<QuestionsPage />} />
                <Route path="questions/new" element={<NewQuestionPage />} />
                <Route path="questions/edit/:id" element={<NewQuestionPage />} />
                <Route path="interviews" element={<InterviewsPage />} />
                <Route path="interviews/new" element={<NewInterviewPage />} />
              </Route>
              <Route path="/interview/:token" element={<IntervieweeLogin />} />
              <Route path="/interview/:token/start" element={<IntervieweeDashboard />} />
              <Route path="/interview/:token/complete" element={<CompletionScreen />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </InterviewProvider>
        </QuestionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;