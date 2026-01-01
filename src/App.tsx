import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/Auth/PrivateRoute';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import SubjectsPage from './components/Subjects/SubjectsPage';
import CalendarPage from './components/Calendar/CalendarPage';
import ProgressPage from './components/Progress/ProgressPage';
import ThemeToggle from './components/Theme/ThemeToggle';
import './styles-modern.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <ThemeToggle />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/subjects"
                element={
                  <PrivateRoute>
                    <SubjectsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <PrivateRoute>
                    <CalendarPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/progress"
                element={
                  <PrivateRoute>
                    <ProgressPage />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
