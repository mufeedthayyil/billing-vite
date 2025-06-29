import React, { useEffect, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Equipment, db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { EquipmentCard } from '../components/EquipmentCard'
import toast from 'react-hot-toast'

export function Home() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadEquipment()
  }, [])

  useEffect(() => {
    filterEquipment()
  }, [equipment, searchTerm])

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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
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

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md mx-auto block rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
          />
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
              Try adjusting your search
            </p>
          </div>
        )}
      </div>
    </div>
  )
}