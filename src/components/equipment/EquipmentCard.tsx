import React, { useState } from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';
import { Equipment } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import Button from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  const { addToCart } = useCart();
  const [selectedDuration, setSelectedDuration] = useState<'12hr' | '24hr'>('24hr');
  const [rentDate, setRentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddToCart = () => {
    const rentDateObj = new Date(rentDate);
    const returnDate = new Date(rentDateObj);
    
    if (selectedDuration === '12hr') {
      returnDate.setHours(returnDate.getHours() + 12);
    } else {
      returnDate.setDate(returnDate.getDate() + 1);
    }

    addToCart(equipment, selectedDuration, rentDate, returnDate.toISOString().split('T')[0]);
    setShowAddForm(false);
  };

  const currentRate = selectedDuration === '12hr' ? equipment.rate_12hr : equipment.rate_24hr;

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={equipment.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={equipment.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{equipment.name}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">{equipment.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Pricing */}
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center justify-center mb-1">
              <Clock size={16} className="mr-1 text-gray-500" />
              <span className="text-xs text-gray-500">12 Hours</span>
            </div>
            <div className="font-semibold text-primary-600">
              {formatCurrency(equipment.rate_12hr)}
            </div>
          </div>
          
          <div className="text-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center justify-center mb-1">
              <Calendar size={16} className="mr-1 text-gray-500" />
              <span className="text-xs text-gray-500">24 Hours</span>
            </div>
            <div className="font-semibold text-primary-600">
              {formatCurrency(equipment.rate_24hr)}
            </div>
          </div>
        </div>

        {/* Add to cart form */}
        {showAddForm ? (
          <div className="space-y-3 p-3 bg-gray-50 rounded-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rental Duration
              </label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value as '12hr' | '24hr')}
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="12hr">12 Hours - {formatCurrency(equipment.rate_12hr)}</option>
                <option value="24hr">24 Hours - {formatCurrency(equipment.rate_24hr)}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rent Date
              </label>
              <input
                type="date"
                value={rentDate}
                onChange={(e) => setRentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
            
            <div className="text-center py-2 border-t border-gray-200">
              <div className="text-sm text-gray-600">Total Cost</div>
              <div className="text-lg font-bold text-primary-600">
                {formatCurrency(currentRate)}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                fullWidth
                onClick={handleAddToCart}
                icon={<Plus size={16} />}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        ) : (
          <Button
            fullWidth
            onClick={() => setShowAddForm(true)}
            icon={<Plus size={16} />}
          >
            Add to Cart
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentCard;