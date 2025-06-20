import React, { useState } from 'react';
import { Plus, Send, Edit, Trash, Eye, CheckCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { mockBills, mockClients, Bill } from '../../data/mockData';
import { formatCurrency, formatDate, getPaymentStatusClass } from '../../lib/utils';

const BillingManager: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [filterType, setFilterType] = useState<'all' | 'advance' | 'final'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  
  // Filter bills based on criteria
  const filteredBills = bills.filter(bill => {
    const matchesType = filterType === 'all' || bill.type === filterType;
    const matchesStatus = filterStatus === 'all' || bill.paymentStatus === filterStatus;
    return matchesType && matchesStatus;
  });
  
  // Handlers for bill actions (mocked for demo)
  const handleViewBill = (id: string) => {
    console.log(`View bill ${id}`);
  };
  
  const handleEditBill = (id: string) => {
    console.log(`Edit bill ${id}`);
  };
  
  const handleDeleteBill = (id: string) => {
    setBills(bills.filter(bill => bill.id !== id));
  };
  
  const handleMarkAsPaid = (id: string) => {
    setBills(
      bills.map(bill => 
        bill.id === id 
          ? { 
              ...bill, 
              status: 'paid' as const, 
              paymentStatus: 'paid' as const,
              amountPaid: bill.total
            } 
          : bill
      )
    );
  };
  
  const handleSendBill = (id: string) => {
    setBills(
      bills.map(bill => 
        bill.id === id 
          ? { ...bill, status: 'sent' as const } 
          : bill
      )
    );
  };
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Manager</h1>
          <p className="text-gray-600 mt-1">
            Create and manage bills for your photography services
          </p>
        </div>
        
        <Button 
          className="mt-4 sm:mt-0"
          icon={<Plus size={16} />}
        >
          Create New Bill
        </Button>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
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
                    <TableCell>{formatCurrency(bill.total)}</TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusClass(bill.paymentStatus)}>
                        {bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewBill(bill.id)}
                          icon={<Eye size={16} />}
                        />
                        
                        {bill.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendBill(bill.id)}
                            icon={<Send size={16} />}
                          />
                        )}
                        
                        {bill.paymentStatus !== 'paid' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-success-600 hover:text-success-700 hover:bg-success-50"
                            onClick={() => handleMarkAsPaid(bill.id)}
                            icon={<CheckCircle size={16} />}
                          />
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditBill(bill.id)}
                          icon={<Edit size={16} />}
                        />
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          onClick={() => handleDeleteBill(bill.id)}
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
              <p>No bills found matching your filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingManager;