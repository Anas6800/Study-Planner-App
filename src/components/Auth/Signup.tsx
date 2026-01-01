import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  // Show loading while checking auth state
  if (!currentUser && authLoading) {
    return (
      <div className="auth-container">
        <div className="auth-form">
          <div className="text-center p-8">
            <div className="loading-spinner"></div>
            <p className="mt-4 text-secondary">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      // Navigation will happen via useEffect when currentUser updates
    } catch (err: any) {
      console.error('Signup error details:', err);
      let errorMessage = 'Failed to create an account. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password authentication is not enabled. Please contact support.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="text-center mb-8">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Start your study journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="error-message fade-in">
              {error}
            </div>
          )}

          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              className="auth-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              required
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              autoComplete="new-password"
              required
              className="auth-input"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <>
                <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '0.5rem' }}></div>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="auth-subtitle">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
