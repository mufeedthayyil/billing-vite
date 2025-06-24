import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Layout
import Header from './components/layout/Header';

// Public pages
import Home from './pages/public/Home';
import Cart from './pages/public/Cart';
import Suggestions from './pages/public/Suggestions';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Staff pages
import Dashboard from './pages/staff/Dashboard';
import Orders from './pages/staff/Orders';

// Admin pages
import AdminPanel from './pages/admin/AdminPanel';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected route component
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  requiredRole?: 'admin' | 'staff';
}> = ({ element, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  return element;
};

function App() {
  return (
    <ErrorBoundary>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/suggestions" element={<Suggestions />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Staff routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute
                  element={<Dashboard />}
                  requiredRole="staff"
                />
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute
                  element={<Orders />}
                  requiredRole="staff"
                />
              }
            />
            
            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  element={<AdminPanel />}
                  requiredRole="admin"
                />
              }
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;