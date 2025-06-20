import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (!success) {
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Login hint (for demo purposes)
  const loginHint = (
    <div className="mt-4 mb-2 p-3 bg-gray-50 rounded-md text-sm text-gray-600 border border-gray-200">
      <p className="font-medium mb-1">Demo Accounts:</p>
      <p>Admin: admin@example.com / admin123</p>
      <p>Customer: customer@example.com / customer123</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Sign in to your account</h3>
      
      {error && (
        <Alert
          variant="error"
          className="mb-4"
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      
      {loginHint}
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={<Lock className="h-5 w-5 text-gray-400" />}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
        >
          Sign in
        </Button>
      </form>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Create a new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;