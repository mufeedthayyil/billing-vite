import React, { useEffect, useState } from 'react'
import { Package, DollarSign, Clock, TrendingUp } from 'lucide-react'
import { Order, Equipment, Suggestion, db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { EquipmentCard } from '../components/EquipmentCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

export function StaffDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'billing' | 'equipment' | 'suggestions'>('billing')
  const [orders, setOrders] = useState<Order[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersData, equipmentData, suggestionsData] = await Promise.all([
        db.getOrders(),
        db.getAvailableEquipment(),
        db.getSuggestions(),
      ])
      
      setOrders(ordersData)
      setEquipment(equipmentData)
      setSuggestions(suggestionsData)
    } catch (error: any) {
      console.error('Error loading staff data:', error)
      toast.error(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleRent = async (equipment: Equipment, duration: '12hr' | '24hr') => {
    if (!user) return

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
      loadData() // Refresh data
    } catch (error: any) {
      console.error('Error creating order:', error)
      toast.error(error.message || 'Failed to create rental order')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Calculate billing statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total_cost, 0)
  const monthlyRevenue = orders
    .filter(order => {
      const orderDate = new Date(order.created_at)
      const now = new Date()
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, order) => sum + order.total_cost, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage orders, rent equipment, and view billing information
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <DollarSign className="inline-block w-4 h-4 mr-2" />
              Billing & Orders ({orders.length})
            </button>
            
            <button
              onClick={() => setActiveTab('equipment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'equipment'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="inline-block w-4 h-4 mr-2" />
              Rent Equipment ({equipment.length})
            </button>
            
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggestions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="inline-block w-4 h-4 mr-2" />
              Suggestions ({suggestions.length})
            </button>
          </nav>
        </div>

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Orders & Billing</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4">Customer</th>
                      <th className="text-left py-3 px-4">Equipment</th>
                      <th className="text-left py-3 px-4">Duration</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{order.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{order.user?.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{order.equipment?.name || 'Unknown Equipment'}</td>
                        <td className="py-3 px-4">{order.duration}</td>
                        <td className="py-3 px-4 font-semibold text-primary-600">
                          {formatCurrency(order.total_cost)}
                        </td>
                        <td className="py-3 px-4">{formatDateTime(order.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Rent Equipment</h2>
            
            {equipment.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {equipment.map((item) => (
                  <EquipmentCard
                    key={item.id}
                    equipment={item}
                    onRent={handleRent}
                    showRentButton={true}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment available</h3>
                <p className="text-gray-600">Equipment will appear here when available</p>
              </div>
            )}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Equipment Suggestions</h2>
            
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <p className="text-gray-900 mb-2">{suggestion.suggestion_text}</p>
                  <div className="text-sm text-gray-500">
                    {suggestion.suggested_by && (
                      <span>Suggested by: {suggestion.suggested_by} • </span>
                    )}
                    {new Date(suggestion.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {suggestions.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h3>
                  <p className="text-gray-600">
                    Equipment suggestions from users will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}