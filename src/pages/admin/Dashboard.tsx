import React from 'react';
import { CreditCard, Calendar, DollarSign, Users, TrendingUp, Check, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { mockBills, getDashboardStats } from '../../data/mockData';
import { formatCurrency, formatDate, getPaymentStatusClass } from '../../lib/utils';

const AdminDashboard: React.FC = () => {
  const stats = getDashboardStats('admin');
  
  // Get recent bills for display
  const recentBills = [...mockBills]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's an overview of your photography business.
        </p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-4">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-warning-100 text-warning-600 mr-4">
                <DollarSign size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.pendingRevenue)}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-success-100 text-success-600 mr-4">
                <Check size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Bills</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.paidBills} <span className="text-sm text-gray-500">of {stats.totalBills}</span>
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-secondary-100 text-secondary-600 mr-4">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Clients</p>
                <h3 className="text-2xl font-bold text-gray-900">3</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
            <CardDescription>
              Latest bills created or updated in your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBills.map(bill => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.billNumber}</TableCell>
                    <TableCell>{bill.clientName}</TableCell>
                    <TableCell>{formatCurrency(bill.total)}</TableCell>
                    <TableCell>{formatDate(bill.issueDate)}</TableCell>
                    <TableCell>
                      <Badge 
                        className={getPaymentStatusClass(bill.paymentStatus)}
                      >
                        {bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Payment summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>
              Overview of your billing status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-success-500 mr-2"></div>
                  <span className="text-sm font-medium">Paid</span>
                </div>
                <span className="font-medium">{stats.paidBills}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-warning-500 mr-2"></div>
                  <span className="text-sm font-medium">Partial</span>
                </div>
                <span className="font-medium">{stats.partialBills}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-error-500 mr-2"></div>
                  <span className="text-sm font-medium">Unpaid</span>
                </div>
                <span className="font-medium">{stats.unpaidBills}</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Collected</span>
                  <span className="font-medium text-success-600">{formatCurrency(stats.totalRevenue)}</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium">Outstanding</span>
                  <span className="font-medium text-error-600">{formatCurrency(stats.pendingRevenue)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;