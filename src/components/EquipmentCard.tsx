import React, { useState } from 'react'
import { Calendar, Clock, Plus } from 'lucide-react'
import { Equipment } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'

interface EquipmentCardProps {
  equipment: Equipment
  onRent?: (equipment: Equipment, duration: '12hr' | '24hr') => void
}

export function EquipmentCard({ equipment, onRent }: EquipmentCardProps) {
  const [selectedDuration, setSelectedDuration] = useState<'12hr' | '24hr'>('24hr')

  const handleRent = () => {
    if (onRent) {
      onRent(equipment, selectedDuration)
    }
  }

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={equipment.image_url}
          alt={equipment.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </div>
      
      <CardHeader>
        <CardTitle className="text-lg">{equipment.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-xs text-gray-500">12 Hours</span>
            </div>
            <div className="font-semibold text-primary-600">
              {formatCurrency(equipment.rate_12hr)}
            </div>
          </div>
          
          <div className="text-center p-2 bg-gray-50 rounded-md">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-xs text-gray-500">24 Hours</span>
            </div>
            <div className="font-semibold text-primary-600">
              {formatCurrency(equipment.rate_24hr)}
            </div>
          </div>
        </div>

        {onRent && (
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
            
            <Button onClick={handleRent} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Rent Equipment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}