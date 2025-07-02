import React, { useEffect, useState } from 'react'
import { Search, MessageSquare, Send } from 'lucide-react'
import { Equipment, db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { EquipmentCard } from '../components/EquipmentCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export function Home() {
  const { user } = useAuth()
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Suggestion form state
  const [suggestionText, setSuggestionText] = useState('')
  const [suggestedBy, setSuggestedBy] = useState('')
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false)

  useEffect(() => {
    loadEquipment()
  }, [])

  useEffect(() => {
    filterEquipment()
  }, [equipment, searchTerm])

  const loadEquipment = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await db.getAvailableEquipment()
      setEquipment(data)
    } catch (error: any) {
      console.error('Error loading equipment:', error)
      setError(error.message || 'Failed to load equipment')
      setEquipment([]) // Set empty array as fallback
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

      await db.createOrder({
        user_id: user.id,
        equipment_id: equipment.id,
        duration,
        total_cost: totalCost,
        rent_date: rentDate,
      })

      toast.success(`Successfully rented ${equipment.name} for ${duration}!`)
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error(error.message || 'Failed to create rental order')
    }
  }

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!suggestionText.trim()) {
      toast.error('Please enter your suggestion')
      return
    }

    setSubmittingSuggestion(true)

    try {
      await db.createSuggestion({
        suggestion_text: suggestionText.trim(),
        suggested_by: suggestedBy.trim() || null,
      })

      toast.success('Thank you for your suggestion!')
      setSuggestionText('')
      setSuggestedBy('')
    } catch (error: any) {
      console.error('Error submitting suggestion:', error)
      toast.error(error.message || 'Failed to submit suggestion')
    } finally {
      setSubmittingSuggestion(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading equipment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Equipment</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadEquipment}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
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
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        {/* Equipment Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredEquipment.length} of {equipment.length} items
          </p>
        </div>

        {/* Equipment Grid */}
        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredEquipment.map((item) => (
              <EquipmentCard
                key={item.id}
                equipment={item}
                onRent={user?.role === 'staff' ? handleRent : undefined}
                showRentButton={user?.role === 'staff'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 mb-12">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No equipment found
            </h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search' : 'No equipment available at the moment'}
            </p>
          </div>
        )}

        {/* Public Suggestion Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold">Suggest Equipment</h3>
              </div>
              <p className="text-gray-600 mt-1">
                Can't find what you need? Let us know what equipment you'd like us to add.
              </p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name or Email (Optional)
                  </label>
                  <input
                    type="text"
                    value={suggestedBy}
                    onChange={(e) => setSuggestedBy(e.target.value)}
                    placeholder="How should we contact you?"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment Suggestion *
                  </label>
                  <textarea
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder="Tell us about the equipment you'd like us to add..."
                    className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    rows={4}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submittingSuggestion}
                  className="btn btn-primary w-full"
                >
                  {submittingSuggestion ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Suggestion
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}