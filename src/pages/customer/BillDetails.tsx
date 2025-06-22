import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, CreditCard, CheckCircle, Download, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import { mockBills } from '../../data/mockData';
import { formatCurrency, formatDate, getPaymentStatusClass, isOverdue } from '../../lib/utils';

const BillDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  
  // Find the bill
  const bill = mockBills.find(bill => bill.id === id);
  
  // Find related bill (advance or final)
  const relatedBill = bill?.relatedBillId
    ? mockBills.find(b => b.id === bill.relatedBillId)
    : undefined;
  
  if (!bill) {
    return (
      <div className="py-8 text-center animate-fade-in">
        <h2 className="text-xl font-bold text-gray-900">Bill Not Found</h2>
        <p className="mt-2 text-gray-600">The bill you're looking for doesn't exist.</p>
        <Link to="/customer/bills" className="inline-block mt-4">
          <Button variant="outline" icon={<ArrowLeft size={16} />}>
            Back to Bills
          </Button>
        </Link>
      </div>
    );
  }
  
  // Calculate remaining amount
  const remainingAmount = bill.total - bill.amountPaid;
  const isOverdueBill = isOverdue(bill.dueDate) && bill.paymentStatus !== 'paid';
  
  const handlePayNow = () => {
    setPaymentError('');
    setIsPaymentProcessing(true);
    
    // Simulate payment processing with potential failure
    setTimeout(() => {
      setIsPaymentProcessing(false);
      
      // Simulate 90% success rate
      if (Math.random() > 0.1) {
        setIsPaymentComplete(true);
      } else {
        setPaymentError('Payment failed. Please try again or contact support.');
      }
    }, 2000);
  };
  
  const handlePrintBill = () => {
    // In a real app, this would generate a PDF or open print dialog
    window.print();
  };
  
  const handleDownloadBill = () => {
    // In a real app, this would generate and download a PDF
    const billData = `
Bill Number: ${bill.billNumber}
Client: ${bill.clientName}
Date: ${formatDate(bill.issueDate)}
Total: ${formatCurrency(bill.total)}
Status: ${bill.paymentStatus}
    `.trim();
    
    const blob = new Blob([billData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bill.billNumber}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          to="/customer/bills" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Bills</span>
        </Link>
      </div>
      
      {/* Bill header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bill #{bill.billNumber}</h1>
          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
            <span>Issued on {formatDate(bill.issueDate)}</span>
            <span>•</span>
            <span className={isOverdueBill ? 'text-error-600 font-medium' : ''}>
              Due {formatDate(bill.dueDate)}
              {isOverdueBill && ' (Overdue)'}
            </span>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDownloadBill}
            icon={<Download size={16} />}
          >
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrintBill}
            icon={<Printer size={16} />}
          >
            Print
          </Button>
        </div>
      </div>
      
      {/* Overdue warning */}
      {isOverdueBill && !isPaymentComplete && (
        <div className="mb-6">
          <Alert 
            variant="error"
            title="Payment Overdue"
            icon={<AlertTriangle size={18} />}
          >
            <p>This bill is overdue. Please make the payment as soon as possible to avoid any service interruptions.</p>
          </Alert>
        </div>
      )}
      
      {/* Payment status */}
      <div className="mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <p className="text-sm font-medium text-gray-500">Payment Status</p>
                <div className="mt-1 flex items-center">
                  <Badge 
                    size="md"
                    className={getPaymentStatusClass(isPaymentComplete ? 'paid' : bill.paymentStatus)}
                  >
                    {isPaymentComplete 
                      ? 'Paid' 
                      : bill.paymentStatus.charAt(0).toUpperCase() + bill.paymentStatus.slice(1)}
                  </Badge>
                  {isOverdueBill && (
                    <Badge className="ml-2 bg-error-100 text-error-800" size="sm">
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(bill.total)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {isPaymentComplete ? 'Amount Paid' : 'Remaining'}
                  </p>
                  <p className={`text-xl font-bold ${
                    isPaymentComplete ? 'text-success-600' : 'text-error-600'
                  }`}>
                    {formatCurrency(isPaymentComplete ? bill.total : remainingAmount)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Payment info message */}
      {!isPaymentComplete && bill.paymentStatus !== 'paid' && (
        <div className="mb-6">
          <Alert 
            variant="info"
            title="Payment Information"
            icon={<CreditCard size={18} />}
          >
            {bill.type === 'advance' ? (
              <p>This is an advance payment for your upcoming photography session. This covers the rental equipment costs and secures your booking.</p>
            ) : (
              <p>This is the final payment for your photography services. {bill.amountPaid > 0 && `The advance amount of ${formatCurrency(bill.amountPaid)} has already been applied to your total.`}</p>
            )}
          </Alert>
        </div>
      )}
      
      {/* Payment success message */}
      {isPaymentComplete && (
        <div className="mb-6">
          <Alert 
            variant="success"
            title="Payment Successful"
            icon={<CheckCircle size={18} />}
          >
            <p>Your payment of {formatCurrency(remainingAmount)} has been processed successfully. Thank you for your business!</p>
          </Alert>
        </div>
      )}
      
      {/* Payment error message */}
      {paymentError && (
        <div className="mb-6">
          <Alert 
            variant="error"
            title="Payment Failed"
            onClose={() => setPaymentError('')}
          >
            <p>{paymentError}</p>
          </Alert>
        </div>
      )}
      
      {/* Bill details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bill Details</CardTitle>
          <CardDescription>
            {bill.type === 'advance' 
              ? 'Advance payment for photography services' 
              : 'Final payment for photography services'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Bill Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Number:</span>
                  <span className="font-medium">{bill.billNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">{formatDate(bill.issueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className={`font-medium ${isOverdueBill ? 'text-error-600' : ''}`}>
                    {formatDate(bill.dueDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill Type:</span>
                  <span className="font-medium">
                    {bill.type === 'advance' ? 'Advance Payment' : 'Final Payment'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(bill.subtotal)}</span>
                </div>
                {bill.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(bill.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(bill.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid Amount:</span>
                  <span className="font-medium text-success-600">
                    {formatCurrency(isPaymentComplete ? bill.total : bill.amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-600">Remaining:</span>
                  <span className={`font-medium ${remainingAmount > 0 && !isPaymentComplete ? 'text-error-600' : 'text-success-600'}`}>
                    {formatCurrency(isPaymentComplete ? 0 : remainingAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-gray-500 mb-4">Bill Items</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal:</span>
              <span>{formatCurrency(bill.subtotal)}</span>
            </div>
            {bill.tax > 0 && (
              <div className="flex justify-between mb-2">
                <span className="font-medium">Tax:</span>
                <span>{formatCurrency(bill.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>{formatCurrency(bill.total)}</span>
            </div>
          </div>
          
          {bill.notes && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{bill.notes}</p>
            </div>
          )}
          
          {/* Related bill info */}
          {relatedBill && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                {bill.type === 'advance' ? 'Final Bill' : 'Advance Bill'} Reference
              </h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Bill Number:</span>
                  <Link 
                    to={`/customer/bills/${relatedBill.id}`} 
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    {relatedBill.billNumber}
                  </Link>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="text-sm font-medium">{formatCurrency(relatedBill.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge 
                    size="sm"
                    className={getPaymentStatusClass(relatedBill.paymentStatus)}
                  >
                    {relatedBill.paymentStatus.charAt(0).toUpperCase() + relatedBill.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Payment action */}
        {!isPaymentComplete && bill.paymentStatus !== 'paid' && remainingAmount > 0 && (
          <CardFooter className="border-t border-gray-200 bg-gray-50 p-6">
            <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="text-sm font-medium text-gray-900">
                  Amount to Pay: {formatCurrency(remainingAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Secure payment via credit card, UPI, or net banking
                </p>
              </div>
              
              <Button
                size="lg"
                icon={<CreditCard size={18} />}
                onClick={handlePayNow}
                isLoading={isPaymentProcessing}
                disabled={isPaymentProcessing}
              >
                {isPaymentProcessing ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default BillDetails;