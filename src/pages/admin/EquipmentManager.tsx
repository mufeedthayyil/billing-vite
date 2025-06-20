import React, { useState } from 'react';
import { Plus, Edit, Trash, Camera, Package, CameraOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { mockEquipment, Equipment } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

const EquipmentManager: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);
  const [isAddingEquipment, setIsAddingEquipment] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const emptyEquipment = {
    id: '',
    name: '',
    category: '',
    rentalCost: 0,
    description: ''
  };
  
  const [formData, setFormData] = useState<Equipment>(emptyEquipment);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rentalCost' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleAddEquipment = () => {
    setIsAddingEquipment(true);
    setFormData({
      ...emptyEquipment,
      id: `${equipment.length + 1}`
    });
  };
  
  const handleEditEquipment = (item: Equipment) => {
    setEditingId(item.id);
    setFormData(item);
  };
  
  const handleDeleteEquipment = (id: string) => {
    setEquipment(equipment.filter(item => item.id !== id));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing
      setEquipment(equipment.map(item => 
        item.id === editingId ? formData : item
      ));
      setEditingId(null);
    } else {
      // Add new
      setEquipment([...equipment, formData]);
      setIsAddingEquipment(false);
    }
    
    setFormData(emptyEquipment);
  };
  
  const handleCancel = () => {
    setIsAddingEquipment(false);
    setEditingId(null);
    setFormData(emptyEquipment);
  };
  
  const categoryIcons = {
    Camera: <Camera size={18} />,
    Lens: <CameraOff size={18} />,
    Lighting: <Camera size={18} />,
    Stabilizer: <Package size={18} />,
    default: <Package size={18} />
  };
  
  const getCategoryIcon = (category: string) => {
    return categoryIcons[category as keyof typeof categoryIcons] || categoryIcons.default;
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipment Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage your photography equipment rental inventory
          </p>
        </div>
        
        {!isAddingEquipment && !editingId && (
          <Button 
            onClick={handleAddEquipment}
            className="mt-4 sm:mt-0"
            icon={<Plus size={16} />}
          >
            Add Equipment
          </Button>
        )}
      </div>
      
      {(isAddingEquipment || editingId) && (
        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Equipment' : 'Add New Equipment'}</CardTitle>
            <CardDescription>
              {editingId 
                ? 'Update the details of your equipment' 
                : 'Add details about equipment you rent for photography sessions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Equipment Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Canon EOS R5"
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                  >
                    <option value="">Select a category</option>
                    <option value="Camera">Camera</option>
                    <option value="Lens">Lens</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Stabilizer">Stabilizer</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Rental Cost (₹)"
                  name="rentalCost"
                  type="number"
                  value={formData.rentalCost.toString()}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="100"
                  placeholder="e.g. 4000"
                />
                
                <Input
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of the equipment"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? 'Update Equipment' : 'Add Equipment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Equipment Inventory</CardTitle>
          <CardDescription>
            Your complete list of rental equipment with costs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {equipment.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Rental Cost</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipment.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2 text-gray-500">
                          {getCategoryIcon(item.category)}
                        </span>
                        {item.category}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(item.rentalCost)}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditEquipment(item)}
                          icon={<Edit size={16} />}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          onClick={() => handleDeleteEquipment(item.id)}
                          icon={<Trash size={16} />}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Camera size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">No equipment added yet</p>
              <p className="text-sm max-w-md mx-auto mb-4">
                Start adding your photography equipment to track rental costs and manage your inventory.
              </p>
              <Button onClick={handleAddEquipment} icon={<Plus size={16} />}>
                Add Your First Equipment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentManager;