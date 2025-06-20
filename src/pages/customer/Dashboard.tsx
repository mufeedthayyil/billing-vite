import React from 'react';
import { CreditCard, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { mockBills, getDashboardStats } from '../../data/mockData';
import { formatCurrency, formatDate, getPaymentStatusClass } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const stats = getDashboardStats('customer', user?.id);
  
  // Get recent bills for this customer
  const customerBills = mockBills.filter(bill => bill.clientId === user?.id || '2');
  const recentBills = [...customerBills]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 3);
  
  // Find bills that need attention (unpaid)
  const unpaidBills = customerBills.filter(bill => 
    bill.paymentStatus === 'unpaid' || bill.paymentStatus === 'partial'
  );
  
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's an overview of your photography services and billing.
        </p>
      </div>
      
      {/* Highlight unpaid bills section */}
      {unpaidBills.length > 0 && (
        <Card className="mb-6 bg-primary-50 border-primary-100">
          <CardContent className="p-6">
            <div className="flex items-start sm:items-center flex-col sm:flex-row sm:justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <AlertCircle size={24} className="text-primary-600 mr-4" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    You have {unpaidBills.length} pending {unpaidBills.length === 1 ? 'payment' : 'payments'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Please review and complete your payments to continue enjoying our photography services.
                  </p>
                </div>
              </div>
              <Link to="/customer/bills">
                <Button>
                  View Bills
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary-100 text-primary-600 mr-4">
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
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
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Payment</p>
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
                <CheckCircle size={24} />
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
      </div>
      
      {/* Recent bills */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>
            Your most recent photography service bills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentBills.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBills.map(bill => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.billNumber}</TableCell>
                    <TableCell>{formatDate(bill.issueDate)}</TableCell>
                    <TableCell>{formatCurrency(bill.total)}</TableCell>
                    <TableCell>
                      <Badge 
                        className={getPaymentStatusClass(bill.paymentStatus)}
                      >
                        {bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/customer/bills/${bill.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>You don't have any bills yet.</p>
            </div>
          )}
        </CardContent>
        {recentBills.length > 0 && (
          <CardFooter className="border-t border-gray-200 bg-gray-50 p-4">
            <Link to="/customer/bills" className="text-primary-600 font-medium text-sm flex items-center mx-auto">
              View all bills
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default CustomerDashboard;