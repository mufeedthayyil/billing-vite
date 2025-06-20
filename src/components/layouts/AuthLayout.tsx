import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Redirect authenticated users to their appropriate dashboard
  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/customer" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Camera size={48} className="text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          PhotoBill
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Professional photography billing platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>© 2025 PhotoBill. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;