import React, { useState } from 'react';
import { Plus, Send, Edit, Trash, Eye, CheckCircle, Filter, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import { mockBills, mockClients, Bill, BillStatus, PaymentStatus, BillType } from '../../data/mockData';
import { formatCurrency, formatDate, getPaymentStatusClass } from '../../lib/utils';
import BillForm from '../../components/billing/BillForm';

const BillingManager: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [filterType, setFilterType] = useState<'all' | 'advance' | 'final'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  const [showBillForm, setShowBillForm] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Filter bills based on criteria
  const filteredBills = bills.filter(bill => {
    const matchesType = filterType === 'all' || bill.type === filterType;
    const matchesStatus = filterStatus === 'all' || bill.paymentStatus === filterStatus;
    return matchesType && matchesStatus;
  });
  
  // Show success message temporarily
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 5000);
  };
  
  // Show error message temporarily
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 5000);
  };
  
  // Handlers for bill actions
  const handleViewBill = (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (bill) {
      // In a real app, this would navigate to a detailed view
      console.log('Viewing bill:', bill);
      showSuccess(`Viewing bill ${bill.billNumber}`);
    }
  };
  
  const handleEditBill = (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (bill) {
      setEditingBill(bill);
      setShowBillForm(true);
    }
  };
  
  const handleDeleteBill = (id: string) => {
    if (window.confirm('Are you sure you want to delete this bill? This action cannot be undone.')) {
      const bill = bills.find(b => b.id === id);
      setBills(bills.filter(bill => bill.id !== id));
      showSuccess(`Bill ${bill?.billNumber} has been deleted successfully.`);
    }
  };
  
  const handleMarkAsPaid = (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (bill && window.confirm(`Mark bill ${bill.billNumber} as fully paid?`)) {
      setBills(
        bills.map(bill => 
          bill.id === id 
            ? { 
                ...bill, 
                status: 'paid' as BillStatus, 
                paymentStatus: 'paid' as PaymentStatus,
                amountPaid: bill.total,
                updatedAt: new Date().toISOString().split('T')[0]
              } 
            : bill
        )
      );
      showSuccess(`Bill ${bill.billNumber} has been marked as paid.`);
    }
  };
  
  const handleSendBill = (id: string) => {
    const bill = bills.find(b => b.id === id);
    if (bill && window.confirm(`Send bill ${bill.billNumber} to ${bill.clientName}?`)) {
      setBills(
        bills.map(bill => 
          bill.id === id 
            ? { 
                ...bill, 
                status: 'sent' as BillStatus,
                updatedAt: new Date().toISOString().split('T')[0]
              } 
            : bill
        )
      );
      showSuccess(`Bill ${bill.billNumber} has been sent to ${bill.clientName}.`);
    }
  };
  
  const handleCreateBill = () => {
    setEditingBill(null);
    setShowBillForm(true);
  };
  
  const handleBillFormSubmit = (billData: Partial<Bill>) => {
    if (editingBill) {
      // Update existing bill
      setBills(bills.map(bill => 
        bill.id === editingBill.id 
          ? { ...bill, ...billData, updatedAt: new Date().toISOString().split('T')[0] }
          : bill
      ));
      showSuccess(`Bill ${editingBill.billNumber} has been updated successfully.`);
    } else {
      // Create new bill
      const newBill: Bill = {
        id: (bills.length + 1).toString(),
        ...billData as Bill,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setBills([...bills, newBill]);
      showSuccess(`Bill ${newBill.billNumber} has been created successfully.`);
    }
    
    setShowBillForm(false);
    setEditingBill(null);
  };
  
  const handleBillFormCancel = () => {
    setShowBillForm(false);
    setEditingBill(null);
  };
  
  const handleExportBills = () => {
    // In a real app, this would generate and download a CSV/Excel file
    const csvContent = [
      ['Bill Number', 'Client', 'Type', 'Date', 'Total', 'Status'].join(','),
      ...filteredBills.map(bill => [
        bill.billNumber,
        bill.clientName,
        bill.type,
        bill.issueDate,
        bill.total,
        bill.paymentStatus
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bills-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showSuccess('Bills exported successfully!');
  };
  
  // Calculate summary stats
  const totalAmount = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
  const paidAmount = filteredBills.reduce((sum, bill) => sum + bill.amountPaid, 0);
  const pendingAmount = totalAmount - paidAmount;
  
  if (showBillForm) {
    return (
      <BillForm
        bill={editingBill}
        onSubmit={handleBillFormSubmit}
        onCancel={handleBillFormCancel}
      />
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Manager</h1>
          <p className="text-gray-600 mt-1">
            Create and manage bills for your photography services
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button 
            variant="outline"
            onClick={handleExportBills}
            icon={<Download size={16} />}
          >
            Export
          </Button>
          <Button 
            onClick={handleCreateBill}
            icon={<Plus size={16} />}
          >
            Create New Bill
          </Button>
        </div>
      </div>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <Alert 
          variant="success" 
          className="mb-6"
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}
      
      {errorMessage && (
        <Alert 
          variant="error" 
          className="mb-6"
          onClose={() => setErrorMessage('')}
        >
          {errorMessage}
        </Alert>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="p-2 rounded-full bg-primary-100 text-primary-600">
                <Calendar size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount Collected</p>
                <p className="text-2xl font-bold text-success-600">{formatCurrency(paidAmount)}</p>
              </div>
              <div className="p-2 rounded-full bg-success-100 text-success-600">
                <CheckCircle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Amount</p>
                <p className="text-2xl font-bold text-error-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <div className="p-2 rounded-full bg-error-100 text-error-600">
                <Calendar size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center">
          <Filter size={16} className="mr-2 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">Filters:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <select
            className="rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="all">All Types</option>
            <option value="advance">Advance Bills</option>
            <option value="final">Final Bills</option>
          </select>
          
          <select
            className="rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="partial">Partially Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {filteredBills.length} of {bills.length} bills
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Bill Management</CardTitle>
          <CardDescription>
            View and manage all your client bills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBills.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map(bill => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.billNumber}</TableCell>
                      <TableCell>{bill.clientName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={bill.type === 'advance' ? 'primary' : 'secondary'}
                          size="sm"
                        >
                          {bill.type === 'advance' ? 'Advance' : 'Final'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(bill.issueDate)}</TableCell>
                      <TableCell>
                        <span className={new Date(bill.dueDate) < new Date() && bill.paymentStatus !== 'paid' 
                          ? 'text-error-600 font-medium' 
                          : ''
                        }>
                          {formatDate(bill.dueDate)}
                        </span>
                      </TableCell>
                      <TableCell>{formatCurrency(bill.total)}</TableCell>
                      <TableCell>{formatCurrency(bill.amountPaid)}</TableCell>
                      <TableCell>
                        <Badge className={getPaymentStatusClass(bill.paymentStatus)}>
                          {bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewBill(bill.id)}
                            icon={<Eye size={16} />}
                            title="View Bill"
                          />
                          
                          {bill.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendBill(bill.id)}
                              icon={<Send size={16} />}
                              title="Send Bill"
                            />
                          )}
                          
                          {bill.paymentStatus !== 'paid' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-success-600 hover:text-success-700 hover:bg-success-50"
                              onClick={() => handleMarkAsPaid(bill.id)}
                              icon={<CheckCircle size={16} />}
                              title="Mark as Paid"
                            />
                          )}
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditBill(bill.id)}
                            icon={<Edit size={16} />}
                            title="Edit Bill"
                          />
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-error-600 hover:text-error-700 hover:bg-error-50"
                            onClick={() => handleDeleteBill(bill.id)}
                            icon={<Trash size={16} />}
                            title="Delete Bill"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">No bills found</p>
              <p className="text-sm max-w-md mx-auto mb-4">
                {filterType !== 'all' || filterStatus !== 'all' 
                  ? 'No bills match your current filters. Try adjusting the filters above.'
                  : 'You haven\'t created any bills yet. Create your first bill to get started.'
                }
              </p>
              {filterType === 'all' && filterStatus === 'all' && (
                <Button onClick={handleCreateBill} icon={<Plus size={16} />}>
                  Create Your First Bill
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingManager;