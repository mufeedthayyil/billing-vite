import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Users, Package, MessageSquare, DollarSign } from 'lucide-react'
import { Equipment, User, Suggestion, Order, db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'equipment' | 'users' | 'suggestions' | 'billing'>('equipment')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  
  // Equipment form state
  const [showEquipmentForm, setShowEquipmentForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    image_url: '',
    rate_12hr: 0,
    rate_24hr: 0,
    available: true,
  })

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'staff')) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [equipmentData, usersData, suggestionsData, ordersData] = await Promise.all([
        db.getAllEquipment(),
        db.getUsers(),
        db.getSuggestions(),
        db.getOrders(),
      ])
      
      setEquipment(equipmentData)
      setUsers(usersData)
      setSuggestions(suggestionsData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
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

  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingEquipment) {
        await db.updateEquipment(editingEquipment.id, equipmentForm)
        toast.success('Equipment updated successfully')
      } else {
        await db.createEquipment(equipmentForm)
        toast.success('Equipment created successfully')
      }
      
      setShowEquipmentForm(false)
      setEditingEquipment(null)
      setEquipmentForm({
        name: '',
        image_url: '',
        rate_12hr: 0,
        rate_24hr: 0,
        available: true,
      })
      
      loadData()
    } catch (error) {
      console.error('Error saving equipment:', error)
      toast.error('Failed to save equipment')
    }
  }

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item)
    setEquipmentForm({
      name: item.name,
      image_url: item.image_url,
      rate_12hr: item.rate_12hr,
      rate_24hr: item.rate_24hr,
      available: item.available,
    })
    setShowEquipmentForm(true)
  }

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return
    
    try {
      await db.deleteEquipment(id)
      toast.success('Equipment deleted successfully')
      loadData()
    } catch (error) {
      console.error('Error deleting equipment:', error)
      toast.error('Failed to delete equipment')
    }
  }

  const handleDeleteSuggestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this suggestion?')) return
    
    try {
      await db.deleteSuggestion(id)
      toast.success('Suggestion deleted successfully')
      loadData()
    } catch (error) {
      console.error('Error deleting suggestion:', error)
      toast.error('Failed to delete suggestion')
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'staff' | 'customer') => {
    try {
      await db.updateUser(userId, { role: newRole })
      toast.success('User role updated successfully')
      loadData()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin'
      case 'staff':
        return 'Staff'
      case 'customer':
        return 'Customer'
      default:
        return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'staff':
        return 'bg-blue-100 text-blue-800'
      case 'customer':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

  if (!user || !['admin', 'staff'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Staff access required.</p>
        </div>
      </div>
    )
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user.role === 'admin' ? 'Admin Panel' : 'Staff Dashboard'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user.role === 'admin' 
              ? 'Manage equipment, users, suggestions, and billing'
              : 'Manage equipment and view billing information'
            }
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('equipment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'equipment'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="inline-block w-4 h-4 mr-2" />
              Equipment ({equipment.length})
            </button>
            
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="inline-block w-4 h-4 mr-2" />
                Users ({users.length})
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'suggestions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="inline-block w-4 h-4 mr-2" />
              Suggestions ({suggestions.length})
            </button>
            
            <button
              onClick={() => setActiveTab('billing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <DollarSign className="inline-block w-4 h-4 mr-2" />
              Billing ({orders.length} orders)
            </button>
          </nav>
        </div>

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Equipment Management</h2>
              {user.role === 'admin' && (
                <button
                  onClick={() => setShowEquipmentForm(true)}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </button>
              )}
            </div>

            {/* Equipment Form */}
            {showEquipmentForm && user.role === 'admin' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                </h3>
                <form onSubmit={handleEquipmentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Equipment Name
                      </label>
                      <input
                        type="text"
                        value={equipmentForm.name}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={equipmentForm.image_url}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, image_url: e.target.value }))}
                        required
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        12-Hour Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={equipmentForm.rate_12hr}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, rate_12hr: parseFloat(e.target.value) || 0 }))}
                        required
                        min="0"
                        step="100"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        24-Hour Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={equipmentForm.rate_24hr}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, rate_24hr: parseFloat(e.target.value) || 0 }))}
                        required
                        min="0"
                        step="100"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="available"
                      checked={equipmentForm.available}
                      onChange={(e) => setEquipmentForm(prev => ({ ...prev, available: e.target.checked }))}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                      Available for rent
                    </label>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button type="submit" className="btn btn-primary">
                      {editingEquipment ? 'Update' : 'Create'} Equipment
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEquipmentForm(false)
                        setEditingEquipment(null)
                      }}
                      className="btn btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Equipment List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4">Equipment</th>
                      <th className="text-left py-3 px-4">12hr Rate</th>
                      <th className="text-left py-3 px-4">24hr Rate</th>
                      <th className="text-left py-3 px-4">Status</th>
                      {user.role === 'admin' && (
                        <th className="text-right py-3 px-4">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="font-medium">{item.name}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{formatCurrency(item.rate_12hr)}</td>
                        <td className="py-3 px-4">{formatCurrency(item.rate_24hr)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        {user.role === 'admin' && (
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => handleEditEquipment(item)}
                                className="p-1 text-gray-600 hover:text-primary-600"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteEquipment(item.id)}
                                className="p-1 text-gray-600 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab - Admin Only */}
        {activeTab === 'users' && user.role === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">User Management</h2>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-right py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <select
                            value={user.role}
                            onChange={(e) => handleUpdateUserRole(user.id, e.target.value as 'admin' | 'staff' | 'customer')}
                            className="text-sm rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Equipment Suggestions</h2>
            
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 mb-2">{suggestion.suggestion_text}</p>
                      <div className="text-sm text-gray-500">
                        {suggestion.suggested_by && (
                          <span>Suggested by: {suggestion.suggested_by} • </span>
                        )}
                        {new Date(suggestion.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleDeleteSuggestion(suggestion.id)}
                        className="p-1 text-gray-600 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {suggestions.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h3>
                  <p className="text-gray-600">
                    Equipment suggestions from users will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Billing & Revenue</h2>
            
            {/* Revenue Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(totalRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">All time</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(monthlyRevenue)}</p>
                <p className="text-sm text-gray-500 mt-1">Current month</p>
              </div>
            </div>

            {/* Orders Table */}
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
      </div>
    </div>
  )
}