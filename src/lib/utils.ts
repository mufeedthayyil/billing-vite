import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency for display
export function formatCurrency(amount: number, currency = '₹') {
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

// Format date for display
export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Generate payment status badge class
export function getPaymentStatusClass(status: 'paid' | 'unpaid' | 'partial') {
  switch (status) {
    case 'paid':
      return 'bg-success-100 text-success-800';
    case 'unpaid':
      return 'bg-error-100 text-error-800';
    case 'partial':
      return 'bg-warning-100 text-warning-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Calculate payment status based on amounts
export function calculatePaymentStatus(totalAmount: number, paidAmount: number) {
  if (paidAmount >= totalAmount) {
    return 'paid';
  } else if (paidAmount > 0) {
    return 'partial';
  } else {
    return 'unpaid';
  }
}