import React, { useState } from 'react';
import Logo from '../../assets/Logo.jpg';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login successful:', data.data.user);
        // Use AuthContext login function to update state
        login(data.data.user, data.data.token);
        
        // Navigate based on role
        const role = data.data.user.role;
        console.log('Navigating to role:', role);
        switch (role) {
          case 'staff-manager':
            console.log('Navigating to /staff-manager');
            navigate('/staff-manager');
            break;
          case 'call-operator':
            console.log('Navigating to /call-operator');
            navigate('/call-operator');
            break;
          case 'vehicle-officer':
            console.log('Navigating to /vehicle-officer');
            navigate('/vehicle-officer');
            break;
          case 'station-officer':
            console.log('Navigating to /station-officer');
            navigate('/station-officer');
            break;
          default:
            console.log('Navigating to /');
            navigate('/');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 via-red-500 to-white p-4">
      {/* Decorative gradient orbs */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-red-400/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-rose-300/30 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl bg-white/95 backdrop-blur-sm border border-zinc-200 shadow-[0_10px_40px_rgba(0,0,0,0.12)] ring-1 ring-white/60">
          <div className="p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={Logo}
            alt="FIRE-LINK-LANKA"
            className="h-14 w-14 mx-auto mb-3 rounded shadow-sm"
          />
              <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">FIRE-LINK-LANKA</h1>
              <p className="text-sm text-zinc-500">Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-zinc-700 mb-1.5">Username</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"/></svg>
              </span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Enter your username"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/70 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">Password</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V8a5 5 0 0110 0v3"/></svg>
              </span>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full pl-11 pr-4 py-3 rounded-lg border border-zinc-300 bg-white text-zinc-900 placeholder-zinc-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/70 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm shadow-sm">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4 rounded-lg font-semibold tracking-wide shadow-md hover:from-red-700 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Small footer note */}
        <div className="mt-8 text-center text-xs text-zinc-400">
          © {new Date().getFullYear()} FIRE-LINK-LANKA
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
