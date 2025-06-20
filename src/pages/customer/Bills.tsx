import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { mockBills } from '../../data/mockData';
import { formatCurrency, formatDate, getPaymentStatusClass } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const Bills: React.FC = () => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'advance' | 'final'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid' | 'partial'>('all');
  
  // Get bills for this customer
  const customerBills = mockBills.filter(bill => bill.clientId === user?.id || '2');
  
  // Filter bills based on criteria
  const filteredBills = customerBills.filter(bill => {
    const matchesType = filterType === 'all' || bill.type === filterType;
    const matchesStatus = filterStatus === 'all' || bill.paymentStatus === filterStatus;
    return matchesType && matchesStatus;
  });
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bills</h1>
        <p className="text-gray-600 mt-1">
          View and manage all your photography service bills
        </p>
      </div>
      
      {/* Status summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-warning-100 text-warning-600 mr-4">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Pending
                </h3>
                <p className="text-sm text-gray-500">
                  {customerBills.filter(bill => bill.paymentStatus === 'unpaid').length} bills
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-error-100 text-error-600 mr-4">
                <AlertCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Partially Paid
                </h3>
                <p className="text-sm text-gray-500">
                  {customerBills.filter(bill => bill.paymentStatus === 'partial').length} bills
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-success-100 text-success-600 mr-4">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Paid
                </h3>
                <p className="text-sm text-gray-500">
                  {customerBills.filter(bill => bill.paymentStatus === 'paid').length} bills
                </p>
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
      </div>
      
      {/* Bills list */}
      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
          <CardDescription>
            Your complete billing history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBills.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
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
                    <TableCell>{formatCurrency(bill.amountPaid)}</TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusClass(bill.paymentStatus)}>
                        {bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/customer/bills/${bill.id}`}>
                        <Button size="sm">
                          {bill.paymentStatus !== 'paid' ? 'Pay Now' : 'View'}
                        </Button>
                      </Link>
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

export default Bills;