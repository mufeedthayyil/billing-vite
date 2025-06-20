import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layouts
import AdminLayout from './components/layouts/AdminLayout';
import CustomerLayout from './components/layouts/CustomerLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminDashboard from './pages/admin/Dashboard';
import EquipmentManager from './pages/admin/EquipmentManager';
import BillingManager from './pages/admin/BillingManager';
import ClientManager from './pages/admin/ClientManager';
import CustomerDashboard from './pages/customer/Dashboard';
import Bills from './pages/customer/Bills';
import BillDetails from './pages/customer/BillDetails';
import Profile from './pages/shared/Profile';
import NotFound from './pages/shared/NotFound';

// Route guards
const ProtectedRoute: React.FC<{
  element: React.ReactElement;
  requiredRole?: string;
}> = ({ element, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return element;
};

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      
      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute
            element={<AdminLayout />}
            requiredRole="admin"
          />
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="equipment" element={<EquipmentManager />} />
        <Route path="billing" element={<BillingManager />} />
        <Route path="clients" element={<ClientManager />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Customer routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute
            element={<CustomerLayout />}
            requiredRole="customer"
          />
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="bills" element={<Bills />} />
        <Route path="bills/:id" element={<BillDetails />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      
      {/* Root redirect */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/customer" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;