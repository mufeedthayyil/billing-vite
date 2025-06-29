import React, { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Equipment, db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { EquipmentCard } from '../components/EquipmentCard'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export function Home() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [priceFilter, setPriceFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')

  useEffect(() => {
    loadEquipment()
  }, [])

  useEffect(() => {
    filterEquipment()
  }, [equipment, searchTerm, priceFilter])

  const loadEquipment = async () => {
    try {
      const data = await db.getEquipment()
      setEquipment(data)
    } catch (error) {
      console.error('Error loading equipment:', error)
      toast.error('Failed to load equipment')
    } finally {
      setLoading(false)
    }
  }

  const filterEquipment = () => {
    let filtered = equipment

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (priceFilter !== 'all') {
      filtered = filtered.filter(item => {
        const maxRate = Math.max(item.rate_12hr, item.rate_24hr)
        switch (priceFilter) {
          case 'low':
            return maxRate <= 2000
          case 'medium':
            return maxRate > 2000 && maxRate <= 5000
          case 'high':
            return maxRate > 5000
          default:
            return true
        }
      })
    }

    setFilteredEquipment(filtered)
  }

  const handleRent = async (equipment: Equipment, duration: '12hr' | '24hr') => {
    if (!user) {
      toast.error('Please sign in to rent equipment')
      return
    }

    try {
      const totalCost = duration === '12hr' ? equipment.rate_12hr : equipment.rate_24hr
      const rentDate = new Date().toISOString()
      const returnDate = new Date(Date.now() + (duration === '12hr' ? 12 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString()

      await db.createOrder({
        user_id: user.id,
        equipment_id: equipment.id,
        duration,
        total_cost: totalCost,
        rent_date: rentDate,
        return_date: returnDate,
      })

      toast.success(`Successfully rented ${equipment.name} for ${duration}!`)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create rental order')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Camera Equipment Rental
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Rent high-quality cameras, lenses, and accessories with flexible 12-hour and 24-hour rates.
          </p>
        </div>

        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="sm:w-48">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Prices</option>
              <option value="low">Under ₹2,000</option>
              <option value="medium">₹2,000 - ₹5,000</option>
              <option value="high">Above ₹5,000</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEquipment.length} of {equipment.length} items
          </p>
        </div>

        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onRent={user ? handleRent : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No equipment found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  )
}