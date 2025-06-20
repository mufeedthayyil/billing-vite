import React, { useState } from 'react';
import { Plus, Edit, Trash, User, Mail, Phone, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { mockClients, Client } from '../../data/mockData';

const ClientManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const emptyClient = {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: ''
  };
  
  const [formData, setFormData] = useState<Client>(emptyClient);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddClient = () => {
    setIsAddingClient(true);
    setFormData({
      ...emptyClient,
      id: `${clients.length + 1}`
    });
  };
  
  const handleEditClient = (client: Client) => {
    setEditingId(client.id);
    setFormData(client);
  };
  
  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing
      setClients(clients.map(client => 
        client.id === editingId ? formData : client
      ));
      setEditingId(null);
    } else {
      // Add new
      setClients([...clients, formData]);
      setIsAddingClient(false);
    }
    
    setFormData(emptyClient);
  };
  
  const handleCancel = () => {
    setIsAddingClient(false);
    setEditingId(null);
    setFormData(emptyClient);
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage your photography clients and their information
          </p>
        </div>
        
        {!isAddingClient && !editingId && (
          <Button 
            onClick={handleAddClient}
            className="mt-4 sm:mt-0"
            icon={<Plus size={16} />}
          >
            Add Client
          </Button>
        )}
      </div>
      
      {(isAddingClient || editingId) && (
        <Card className="mb-6 animate-slide-up">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Client' : 'Add New Client'}</CardTitle>
            <CardDescription>
              {editingId 
                ? 'Update your client\'s contact information' 
                : 'Add a new client to your photography business'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Rahul Sharma"
                  icon={<User className="h-5 w-5 text-gray-400" />}
                />
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. client@example.com"
                  icon={<Mail className="h-5 w-5 text-gray-400" />}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. +91 9876543210"
                  icon={<Phone className="h-5 w-5 text-gray-400" />}
                />
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Home className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Full address"
                      className="pl-10 pr-4 py-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      rows={3}
                    />
                  </div>
                </div>
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
                  {editingId ? 'Update Client' : 'Add Client'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>
            Your complete list of photography clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map(client => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {client.address}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClient(client)}
                          icon={<Edit size={16} />}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          onClick={() => handleDeleteClient(client.id)}
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
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">No clients added yet</p>
              <p className="text-sm max-w-md mx-auto mb-4">
                Start adding your photography clients to keep track of their information and manage their bills.
              </p>
              <Button onClick={handleAddClient} icon={<Plus size={16} />}>
                Add Your First Client
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientManager;