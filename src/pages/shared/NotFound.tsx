import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

const NotFound: React.FC = () => {
  const { user } = useAuth();
  
  // Determine where to redirect based on user role
  const homePath = user 
    ? user.role === 'admin' 
      ? '/admin' 
      : '/customer'
    : '/login';
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Camera size={64} className="mx-auto text-primary-600" />
        <h2 className="mt-6 text-3xl font-bold text-gray-900">
          Page Not Found
        </h2>
        <p className="mt-2 text-center text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Link to={homePath}>
            <Button icon={<ArrowLeft size={16} />}>
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;