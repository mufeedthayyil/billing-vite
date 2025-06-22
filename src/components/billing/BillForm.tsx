import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash, Save, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Alert from '../ui/Alert';
import { mockClients, mockEquipment, Bill, BillItem, BillType, generateBillNumber, calculateBillTotals } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

interface BillFormProps {
  bill?: Bill | null;
  onSubmit: (billData: Partial<Bill>) => void;
  onCancel: () => void;
}

const BillForm: React.FC<BillFormProps> = ({ bill, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    billNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    type: 'advance' as BillType,
    notes: '',
    taxRate: 0
  });
  
  const [items, setItems] = useState<BillItem[]>([
    {
      id: '1',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
  ]);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Initialize form data when editing
  useEffect(() => {
    if (bill) {
      setFormData({
        clientId: bill.clientId,
        clientName: bill.clientName,
        billNumber: bill.billNumber,
        issueDate: bill.issueDate,
        dueDate: bill.dueDate,
        type: bill.type,
        notes: bill.notes || '',
        taxRate: (bill.tax / bill.subtotal) * 100 || 0
      });
      setItems(bill.items);
    } else {
      // Set default due date (7 days from issue date)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);
      setFormData(prev => ({
        ...prev,
        dueDate: dueDate.toISOString().split('T')[0]
      }));
    }
  }, [bill]);
  
  // Generate bill number when client or type changes
  useEffect(() => {
    if (formData.clientId && formData.type && !bill) {
      const billNumber = generateBillNumber(formData.type, formData.clientId);
      setFormData(prev => ({ ...prev, billNumber }));
    }
  }, [formData.clientId, formData.type, bill]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'clientId') {
      const client = mockClients.find(c => c.id === value);
      setFormData(prev => ({
        ...prev,
        clientId: value,
        clientName: client?.name || ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'taxRate' ? parseFloat(value) || 0 : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleItemChange = (index: number, field: keyof BillItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    
    // Recalculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    
    setItems(newItems);
  };
  
  const addItem = () => {
    const newItem: BillItem = {
      id: (items.length + 1).toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.clientId) newErrors.clientId = 'Please select a client';
    if (!formData.billNumber) newErrors.billNumber = 'Bill number is required';
    if (!formData.issueDate) newErrors.issueDate = 'Issue date is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    // Validate items
    items.forEach((item, index) => {
      if (!item.description) newErrors[`item_${index}_description`] = 'Description is required';
      if (item.quantity <= 0) newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      if (item.unitPrice <= 0) newErrors[`item_${index}_unitPrice`] = 'Unit price must be greater than 0';
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (status: 'draft' | 'sent') => {
    if (!validateForm()) return;
    
    const { subtotal, tax, total } = calculateBillTotals(items, formData.taxRate);
    
    const billData: Partial<Bill> = {
      ...formData,
      items,
      subtotal,
      tax,
      total,
      amountPaid: bill?.amountPaid || 0,
      status,
      paymentStatus: bill?.paymentStatus || 'unpaid'
    };
    
    onSubmit(billData);
  };
  
  const { subtotal, tax, total } = calculateBillTotals(items, formData.taxRate);
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onCancel}
          icon={<ArrowLeft size={16} />}
          className="mb-4"
        >
          Back to Bills
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {bill ? 'Edit Bill' : 'Create New Bill'}
        </h1>
        <p className="text-gray-600 mt-1">
          {bill ? 'Update bill details and items' : 'Create a new bill for your photography services'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bill details */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
              <CardDescription>
                Basic information about the bill
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                  >
                    <option value="">Select a client</option>
                    {mockClients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && <p className="mt-1 text-sm text-error-600">{errors.clientId}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bill Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3 border"
                  >
                    <option value="advance">Advance Payment</option>
                    <option value="final">Final Payment</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Bill Number *"
                  name="billNumber"
                  value={formData.billNumber}
                  onChange={handleInputChange}
                  error={errors.billNumber}
                  disabled={!!bill}
                />
                
                <Input
                  label="Issue Date *"
                  name="issueDate"
                  type="date"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  error={errors.issueDate}
                />
                
                <Input
                  label="Due Date *"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  error={errors.dueDate}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or terms"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Bill items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Bill Items</CardTitle>
                  <CardDescription>
                    Add services and equipment to this bill
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  icon={<Plus size={16} />}
                >
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                      {items.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          icon={<Trash size={16} />}
                          className="text-error-600 hover:text-error-700"
                        />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          placeholder="Service or equipment description"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        {errors[`item_${index}_description`] && (
                          <p className="mt-1 text-sm text-error-600">{errors[`item_${index}_description`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        {errors[`item_${index}_quantity`] && (
                          <p className="mt-1 text-sm text-error-600">{errors[`item_${index}_quantity`]}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price (₹) *
                        </label>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="100"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        {errors[`item_${index}_unitPrice`] && (
                          <p className="mt-1 text-sm text-error-600">{errors[`item_${index}_unitPrice`]}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        Total: {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Summary sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Tax Rate (%):</span>
                    <input
                      type="number"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-20 text-sm rounded border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax Amount:</span>
                    <span className="text-sm font-medium">{formatCurrency(tax)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total:</span>
                    <span className="text-base font-bold text-gray-900">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                fullWidth
                onClick={() => handleSubmit('draft')}
                icon={<Save size={16} />}
              >
                Save as Draft
              </Button>
              
              <Button
                fullWidth
                variant="secondary"
                onClick={() => handleSubmit('sent')}
                icon={<Send size={16} />}
              >
                Save & Send
              </Button>
              
              <Button
                fullWidth
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BillForm;