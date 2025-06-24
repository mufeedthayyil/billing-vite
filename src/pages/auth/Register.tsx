import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const Register: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await register(name.trim(), email, password);
      
      if (!result.success) {
        setError(result.error || 'Registration failed');
      } else {
        if (result.error) {
          // This means registration succeeded but email verification is required
          setSuccess(result.error);
        } else {
          setSuccess('Registration successful! You can now sign in.');
          // Clear form
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Camera size={48} className="text-primary-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Join LensPro Rentals
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your account to start renting professional equipment
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <Alert
              variant="error"
              className="mb-4"
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              variant="success"
              className="mb-4"
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="name"
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Enter your full name"
              icon={<User className="h-5 w-5 text-gray-400" />}
            />
            
            <Input
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="Enter your email"
              icon={<Mail className="h-5 w-5 text-gray-400" />}
            />
            
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Create a password (min 6 characters)"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />
            
            <Input
              id="confirm-password"
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Confirm your password"
              icon={<Lock className="h-5 w-5 text-gray-400" />}
            />
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading || !name.trim() || !email || !password || !confirmPassword}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-gray-600">Already have an account?</span>{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;