import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      console.log('Login: Redirecting to dashboard, user:', currentUser.email);
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
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      await login(email, password);
      console.log('Login successful, waiting for redirect...');
      // Navigation will happen via useEffect when currentUser updates
    } catch (err: any) {
      console.error('Login error details:', err);
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password authentication is not enabled. Please enable it in Firebase Console.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="text-center mb-8">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to continue your study journey
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
              autoComplete="current-password"
              required
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="auth-subtitle">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
