import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();

  console.log('ProtectedRoute - user:', user, 'isAuthenticated:', isAuthenticated(), 'requiredRole:', requiredRole);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'flame 2s ease-in-out infinite alternate' }}>🔥</div>
          <p style={{ fontSize: '1.2rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'staff-manager':
        return <Navigate to="/staff-manager" replace />;
      case 'call-operator':
        return <Navigate to="/call-operator" replace />;
      case 'vehicle-officer':
        return <Navigate to="/vehicle-officer" replace />;
      case 'station-officer':
        return <Navigate to="/station-officer" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
