import React, { useState } from 'react'
import { Calendar, Clock, Plus } from 'lucide-react'
import { Equipment } from '../lib/supabase'

interface EquipmentCardProps {
  equipment: Equipment
  onRent?: (equipment: Equipment, duration: '12hr' | '24hr') => void
  showRentButton?: boolean
}

export function EquipmentCard({ equipment, onRent, showRentButton = false }: EquipmentCardProps) {
  const [selectedDuration, setSelectedDuration] = useState<'12hr' | '24hr'>('24hr')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleRent = () => {
    if (onRent) {
      onRent(equipment, selectedDuration)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={equipment.image_url}
        alt={equipment.name}
        className="w-full h-48 object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.src = 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400'
        }}
      />
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {equipment.name}
        </h3>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-xs text-gray-500">12 Hours</span>
            </div>
            <div className="font-semibold text-primary-600">
              {formatCurrency(equipment.rate_12hr)}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-xs text-gray-500">24 Hours</span>
            </div>
            <div className="font-semibold text-primary-600">
              {formatCurrency(equipment.rate_24hr)}
            </div>
          </div>
        </div>

        {showRentButton && onRent && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
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
            
            <button onClick={handleRent} className="btn btn-primary w-full">
              <Plus className="h-4 w-4 mr-2" />
              Rent Equipment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}