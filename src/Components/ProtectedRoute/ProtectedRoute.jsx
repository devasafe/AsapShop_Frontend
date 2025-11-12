import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth-token');
  if (!token) return <Navigate to="/login" />;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isAdmin = payload.user?.isAdmin;

    if (!isAdmin) return <Navigate to="/" />;
    return children;
  } catch {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;
