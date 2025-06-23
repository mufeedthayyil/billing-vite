import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import { formatCurrency, formatDate } from '../../lib/utils';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalCost } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [customerInfo, setCustomerInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }

    if (user?.role !== 'staff' && user?.role !== 'admin') {
      setError('Only staff and admin can create orders. Please contact support.');
      return;
    }

    if (!customerInfo.name || !customerInfo.email) {
      setError('Please fill in all customer information');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create orders for each cart item
      const orderPromises = items.map(item =>
        orderService.create({
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          equipment_id: item.equipment.id,
          duration: item.duration,
          rent_date: item.rentDate,
          return_date: item.returnDate,
          total_cost: item.totalCost,
          handled_by: user.id,
          status: 'confirmed'
        })
      );

      await Promise.all(orderPromises);
      
      setSuccess(`Successfully created ${items.length} order(s)!`);
      clearCart();
      
      // Redirect to orders page after a delay
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      
    } catch (err) {
      setError('Failed to create orders. Please try again.');
      console.error('Error creating orders:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Browse our equipment and add items to your cart to get started.
            </p>
            <Link to="/">
              <Button icon={<ArrowLeft size={16} />}>
                Browse Equipment
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
            <ArrowLeft size={16} className="mr-1" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600">Review your selected equipment and proceed to checkout</p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6">
            {success}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.equipment.id}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={item.equipment.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400'}
                      alt={item.equipment.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.equipment.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.equipment.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Duration: {item.duration}</span>
                        <span>•</span>
                        <span>Rent: {formatDate(item.rentDate)}</span>
                        <span>•</span>
                        <span>Return: {formatDate(item.returnDate)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.equipment.id, item.quantity - 1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.equipment.id, item.quantity + 1)}
                            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <span className="text-lg font-semibold text-primary-600">
                            {formatCurrency(item.totalCost)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.equipment.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Customer Name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  placeholder="+91 9876543210"
                />
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.equipment.id} className="flex justify-between text-sm">
                      <span>{item.equipment.name} × {item.quantity}</span>
                      <span>{formatCurrency(item.totalCost)}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span className="text-primary-600">{formatCurrency(getTotalCost())}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  {!isAuthenticated ? (
                    <Link to="/login?redirect=/cart">
                      <Button fullWidth>
                        Login to Checkout
                      </Button>
                    </Link>
                  ) : user?.role === 'customer' ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-4">
                        Only staff members can create orders. Please contact our team to complete your rental.
                      </p>
                      <Button variant="outline" fullWidth disabled>
                        Contact Staff
                      </Button>
                    </div>
                  ) : (
                    <Button
                      fullWidth
                      onClick={handleCheckout}
                      isLoading={isProcessing}
                      disabled={isProcessing || !customerInfo.name || !customerInfo.email}
                    >
                      {isProcessing ? 'Creating Order...' : 'Create Order'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;