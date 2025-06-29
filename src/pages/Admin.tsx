import React, { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Users, Package, MessageSquare } from 'lucide-react'
import { Equipment, User, Suggestion, db } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'

export function Admin() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'equipment' | 'users' | 'suggestions'>('equipment')
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
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
    if (user?.role === 'admin') {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      const [equipmentData, usersData, suggestionsData] = await Promise.all([
        db.getAllEquipment(),
        db.getUsers(),
        db.getSuggestions(),
      ])
      
      setEquipment(equipmentData)
      setUsers(usersData)
      setSuggestions(suggestionsData)
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
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

  const handleUpdateUserRole = async (userId: string, newRole: 'admin' | 'staff') => {
    try {
      await db.updateUser(userId, { role: newRole })
      toast.success('User role updated successfully')
      loadData()
    } catch (error) {
      console.error('Error updating user role:', error)
      toast.error('Failed to update user role')
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin access required.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">
            Manage equipment, users, and suggestions
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
          </nav>
        </div>

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Equipment Management</h2>
              <Button
                onClick={() => setShowEquipmentForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </div>

            {/* Equipment Form */}
            {showEquipmentForm && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEquipmentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Equipment Name"
                        value={equipmentForm.name}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Input
                        label="Image URL"
                        value={equipmentForm.image_url}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, image_url: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="12-Hour Rate (₹)"
                        type="number"
                        value={equipmentForm.rate_12hr.toString()}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, rate_12hr: parseFloat(e.target.value) || 0 }))}
                        required
                        min="0"
                        step="100"
                      />
                      <Input
                        label="24-Hour Rate (₹)"
                        type="number"
                        value={equipmentForm.rate_24hr.toString()}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, rate_24hr: parseFloat(e.target.value) || 0 }))}
                        required
                        min="0"
                        step="100"
                      />
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
                      <Button type="submit">
                        {editingEquipment ? 'Update' : 'Create'} Equipment
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowEquipmentForm(false)
                          setEditingEquipment(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Equipment List */}
            <Card>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">Equipment</th>
                        <th className="text-left py-3 px-4">12hr Rate</th>
                        <th className="text-left py-3 px-4">24hr Rate</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-right py-3 px-4">Actions</th>
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
                                ? 'bg-success-100 text-success-800' 
                                : 'bg-error-100 text-error-800'
                            }`}>
                              {item.available ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditEquipment(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteEquipment(item.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">User Management</h2>
            
            <Card>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
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
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' 
                                ? 'bg-error-100 text-error-800' 
                                : 'bg-primary-100 text-primary-800'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUserRole(user.id, e.target.value as 'admin' | 'staff')}
                              className="text-sm rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                            >
                              <option value="staff">Staff</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Equipment Suggestions</h2>
            
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-6">
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
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteSuggestion(suggestion.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
      </div>
    </div>
  )
}