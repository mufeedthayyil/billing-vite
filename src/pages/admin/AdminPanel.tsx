import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Package, MessageSquare } from 'lucide-react';
import { 
  equipmentService, 
  suggestionService, 
  userService, 
  Equipment, 
  Suggestion, 
  User 
} from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import { formatCurrency } from '../../lib/utils';

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'equipment' | 'users' | 'suggestions'>('equipment');
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Equipment form state
  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    image_url: '',
    description: '',
    rate_12hr: 0,
    rate_24hr: 0,
    available: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [equipmentData, usersData, suggestionsData] = await Promise.all([
        equipmentService.getAll(),
        userService.getAll(),
        suggestionService.getAll()
      ]);
      
      setEquipment(equipmentData);
      setUsers(usersData);
      setSuggestions(suggestionsData);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 5000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Equipment management
  const handleEquipmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingEquipment) {
        await equipmentService.update(editingEquipment.id, equipmentForm);
        showSuccess('Equipment updated successfully');
      } else {
        await equipmentService.create(equipmentForm);
        showSuccess('Equipment created successfully');
      }
      
      setShowEquipmentForm(false);
      setEditingEquipment(null);
      setEquipmentForm({
        name: '',
        image_url: '',
        description: '',
        rate_12hr: 0,
        rate_24hr: 0,
        available: true
      });
      
      loadData();
    } catch (err) {
      showError('Failed to save equipment');
      console.error('Error saving equipment:', err);
    }
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingEquipment(item);
    setEquipmentForm({
      name: item.name,
      image_url: item.image_url || '',
      description: item.description || '',
      rate_12hr: item.rate_12hr,
      rate_24hr: item.rate_24hr,
      available: item.available
    });
    setShowEquipmentForm(true);
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return;
    
    try {
      await equipmentService.delete(id);
      showSuccess('Equipment deleted successfully');
      loadData();
    } catch (err) {
      showError('Failed to delete equipment');
      console.error('Error deleting equipment:', err);
    }
  };

  // Suggestion management
  const updateSuggestionStatus = async (id: string, status: Suggestion['status']) => {
    try {
      await suggestionService.update(id, { status });
      showSuccess('Suggestion status updated');
      loadData();
    } catch (err) {
      showError('Failed to update suggestion');
      console.error('Error updating suggestion:', err);
    }
  };

  const deleteSuggestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this suggestion?')) return;
    
    try {
      await suggestionService.delete(id);
      showSuccess('Suggestion deleted successfully');
      loadData();
    } catch (err) {
      showError('Failed to delete suggestion');
      console.error('Error deleting suggestion:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
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

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

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
                icon={<Plus size={16} />}
              >
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
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={equipmentForm.description}
                        onChange={(e) => setEquipmentForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500"
                        rows={3}
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
                          setShowEquipmentForm(false);
                          setEditingEquipment(null);
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
                                src={item.image_url || 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400'}
                                alt={item.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-gray-500 text-xs">{item.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{formatCurrency(item.rate_12hr)}</td>
                          <td className="py-3 px-4">{formatCurrency(item.rate_24hr)}</td>
                          <td className="py-3 px-4">
                            <Badge variant={item.available ? 'success' : 'error'}>
                              {item.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditEquipment(item)}
                                icon={<Edit size={16} />}
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteEquipment(item.id)}
                                icon={<Trash2 size={16} />}
                              />
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
                        <th className="text-left py-3 px-4">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{user.name}</td>
                          <td className="py-3 px-4">{user.email}</td>
                          <td className="py-3 px-4">
                            <Badge variant={
                              user.role === 'admin' ? 'error' :
                              user.role === 'staff' ? 'warning' : 'default'
                            }>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
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
            
            <div className="grid gap-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={
                            suggestion.status === 'implemented' ? 'success' :
                            suggestion.status === 'reviewed' ? 'warning' : 'default'
                          }>
                            {suggestion.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            by {suggestion.suggested_by}
                          </span>
                          <span className="text-sm text-gray-500">
                            {suggestion.created_at ? new Date(suggestion.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <p className="text-gray-900">{suggestion.suggestion_text}</p>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {suggestion.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateSuggestionStatus(suggestion.id, 'reviewed')}
                            >
                              Mark Reviewed
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateSuggestionStatus(suggestion.id, 'implemented')}
                            >
                              Mark Implemented
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteSuggestion(suggestion.id)}
                          icon={<Trash2 size={16} />}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {suggestions.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
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
  );
};

export default AdminPanel;