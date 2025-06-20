import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await register(name, email, password, role);
      
      if (!success) {
        setError('Registration failed. This email may already be in use.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Create your account</h3>
      
      {error && (
        <Alert
          variant="error"
          className="mb-4"
          onClose={() => setError('')}
        >
          {error}
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
          placeholder="Create a password"
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
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`flex items-center justify-center p-4 border rounded-md ${
                role === 'customer'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setRole('customer')}
            >
              <User className="h-5 w-5 mr-2" />
              <span>Customer</span>
            </button>
            
            <button
              type="button"
              className={`flex items-center justify-center p-4 border rounded-md ${
                role === 'admin'
                  ? 'bg-primary-50 border-primary-500 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setRole('admin')}
            >
              <Camera className="h-5 w-5 mr-2" />
              <span>Photographer</span>
            </button>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Create account
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <span className="text-gray-600">Already have an account?</span>{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;