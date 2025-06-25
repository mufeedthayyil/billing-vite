import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { Equipment, equipmentService, testConnection, initializeDatabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import EquipmentCard from '../../components/equipment/EquipmentCard';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';

const Home: React.FC = () => {
  const { connectionStatus } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchTerm, priceFilter]);

  const loadEquipment = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🏠 Home: Loading equipment...');
      
      // Initialize database connection
      const initResult = await initializeDatabase();
      if (!initResult.success) {
        throw new Error(initResult.message);
      }
      
      // Load equipment data
      const data = await equipmentService.getAll();
      console.log(`🏠 Home: Loaded ${data.length} equipment items`);
      setEquipment(data);
      
    } catch (err: any) {
      console.error('🏠 Home: Error loading equipment:', err);
      setError(err.message || 'Failed to load equipment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await loadEquipment();
    setIsRetrying(false);
  };

  const filterEquipment = () => {
    let filtered = equipment;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== 'all') {
      filtered = filtered.filter(item => {
        const maxRate = Math.max(item.rate_12hr, item.rate_24hr);
        switch (priceFilter) {
          case 'low':
            return maxRate <= 1000;
          case 'medium':
            return maxRate > 1000 && maxRate <= 3000;
          case 'high':
            return maxRate > 3000;
          default:
            return true;
        }
      });
    }

    setFilteredEquipment(filtered);
  };

  // Show connection status if there's an issue
  if (connectionStatus && !connectionStatus.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="error" className="mb-6">
            <div className="flex items-start">
              <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium">Database Connection Error</h3>
                <p className="text-sm mt-1">{connectionStatus.message}</p>
                <p className="text-sm mt-2 font-medium">Setup Instructions:</p>
                <ol className="text-sm mt-1 ml-4 list-decimal space-y-1">
                  <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">supabase.com</a></li>
                  <li>Copy your project URL and anon key from Settings → API</li>
                  <li>Add them to your .env file as VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                  <li>Run the migration file in your Supabase SQL editor</li>
                </ol>
              </div>
            </div>
          </Alert>
          <Button
            onClick={handleRetry}
            isLoading={isRetrying}
            icon={<RefreshCw size={16} />}
          >
            {isRetrying ? 'Testing Connection...' : 'Retry Connection'}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading equipment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="error" className="mb-6">
            <div className="flex items-start">
              <AlertCircle size={20} className="mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium">Error Loading Equipment</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </Alert>
          <Button
            onClick={handleRetry}
            isLoading={isRetrying}
            icon={<RefreshCw size={16} />}
          >
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Camera Equipment Rental
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rent high-quality cameras, lenses, and accessories with flexible 12-hour and 24-hour rates. 
            Perfect for photographers, videographers, and content creators.
          </p>
        </div>

        {/* Connection Status */}
        {connectionStatus && connectionStatus.success && (
          <Alert variant="success" className="mb-6">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm">Database connected successfully • {equipment.length} items available</span>
            </div>
          </Alert>
        )}

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search size={20} />}
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Prices</option>
              <option value="low">Under ₹1,000</option>
              <option value="medium">₹1,000 - ₹3,000</option>
              <option value="high">Above ₹3,000</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEquipment.length} of {equipment.length} items
            {searchTerm && ` for "${searchTerm}"`}
            {priceFilter !== 'all' && ` in ${priceFilter} price range`}
          </p>
        </div>

        {/* Equipment Grid */}
        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEquipment.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Filter size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || priceFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No equipment available at the moment'}
            </p>
            {(searchTerm || priceFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setPriceFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
            {equipment.length === 0 && (
              <Button
                onClick={handleRetry}
                isLoading={isRetrying}
                icon={<RefreshCw size={16} />}
                className="ml-2"
              >
                {isRetrying ? 'Reloading...' : 'Reload Equipment'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;