import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for merging tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency for display
export function formatCurrency(amount: number, currency = '₹') {
  if (isNaN(amount)) return `${currency}0`;
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

// Format date for display
export function formatDate(date: string | Date) {
  try {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

// Format date for input fields
export function formatDateForInput(date: string | Date) {
  try {
    return new Date(date).toISOString().split('T')[0];
  } catch (error) {
    return '';
  }
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

// Generate bill status badge class
export function getBillStatusClass(status: 'draft' | 'sent' | 'paid' | 'overdue') {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'sent':
      return 'bg-primary-100 text-primary-800';
    case 'paid':
      return 'bg-success-100 text-success-800';
    case 'overdue':
      return 'bg-error-100 text-error-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Calculate payment status based on amounts
export function calculatePaymentStatus(totalAmount: number, paidAmount: number): 'paid' | 'unpaid' | 'partial' {
  if (paidAmount >= totalAmount) {
    return 'paid';
  } else if (paidAmount > 0) {
    return 'partial';
  } else {
    return 'unpaid';
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Indian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Check if date is overdue
export function isOverdue(dueDate: string | Date): boolean {
  return new Date(dueDate) < new Date();
}

// Calculate days between dates
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const firstDate = new Date(date1);
  const secondDate = new Date(date2);
  return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / oneDay));
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Format percentage
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}