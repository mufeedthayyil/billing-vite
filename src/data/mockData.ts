// Types
export interface Equipment {
  id: string;
  name: string;
  category: string;
  rentalCost: number;
  description: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export type BillStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';
export type BillType = 'advance' | 'final';

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Bill {
  id: string;
  clientId: string;
  clientName: string;
  billNumber: string;
  issueDate: string;
  dueDate: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: BillStatus;
  paymentStatus: PaymentStatus;
  notes?: string;
  type: BillType;
  relatedBillId?: string; // For linking advance and final bills
}

// Mock data
export const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Canon EOS R5',
    category: 'Camera',
    rentalCost: 4000,
    description: 'Professional mirrorless camera with 45MP sensor'
  },
  {
    id: '2',
    name: 'Sony A7 III',
    category: 'Camera',
    rentalCost: 3500,
    description: 'Full-frame mirrorless camera with excellent low-light performance'
  },
  {
    id: '3',
    name: 'Canon 24-70mm f/2.8L',
    category: 'Lens',
    rentalCost: 1500,
    description: 'Professional standard zoom lens'
  },
  {
    id: '4',
    name: 'Godox AD200 Flash Kit',
    category: 'Lighting',
    rentalCost: 1200,
    description: 'Portable flash kit with accessories'
  },
  {
    id: '5',
    name: 'DJI Ronin RS2',
    category: 'Stabilizer',
    rentalCost: 2000,
    description: 'Professional camera stabilizer'
  }
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    phone: '+91 9876543210',
    address: '123 MG Road, Bangalore, Karnataka'
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 8765432109',
    address: '456 Park Street, Mumbai, Maharashtra'
  },
  {
    id: '3',
    name: 'Amit Singh',
    email: 'amit@example.com',
    phone: '+91 7654321098',
    address: '789 Connaught Place, New Delhi, Delhi'
  }
];

export const mockBills: Bill[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Rahul Sharma',
    billNumber: 'INV-2025-001-A',
    issueDate: '2025-04-01',
    dueDate: '2025-04-08',
    items: [
      {
        id: '1',
        description: 'Equipment Rental Advance - Wedding Photography',
        quantity: 1,
        unitPrice: 4000,
        total: 4000
      }
    ],
    subtotal: 4000,
    tax: 0,
    total: 4000,
    amountPaid: 4000,
    status: 'paid',
    paymentStatus: 'paid',
    notes: 'Advance payment for wedding photography session on April 15, 2025',
    type: 'advance',
    relatedBillId: '2'
  },
  {
    id: '2',
    clientId: '1',
    clientName: 'Rahul Sharma',
    billNumber: 'INV-2025-001-F',
    issueDate: '2025-04-16',
    dueDate: '2025-04-30',
    items: [
      {
        id: '1',
        description: 'Wedding Photography Service - Full Day',
        quantity: 1,
        unitPrice: 10000,
        total: 10000
      }
    ],
    subtotal: 10000,
    tax: 0,
    total: 10000,
    amountPaid: 4000,
    status: 'sent',
    paymentStatus: 'partial',
    notes: 'Final payment for wedding photography session held on April 15, 2025. Advance of ₹4000 already paid.',
    type: 'final',
    relatedBillId: '1'
  },
  {
    id: '3',
    clientId: '2',
    clientName: 'Priya Patel',
    billNumber: 'INV-2025-002-A',
    issueDate: '2025-04-05',
    dueDate: '2025-04-12',
    items: [
      {
        id: '1',
        description: 'Equipment Rental Advance - Product Photography',
        quantity: 1,
        unitPrice: 3000,
        total: 3000
      }
    ],
    subtotal: 3000,
    tax: 0,
    total: 3000,
    amountPaid: 0,
    status: 'sent',
    paymentStatus: 'unpaid',
    notes: 'Advance payment for product photography session on April 20, 2025',
    type: 'advance',
    relatedBillId: '4'
  },
  {
    id: '4',
    clientId: '2',
    clientName: 'Priya Patel',
    billNumber: 'INV-2025-002-F',
    issueDate: '2025-04-21',
    dueDate: '2025-05-05',
    items: [
      {
        id: '1',
        description: 'Product Photography Service - 10 Products',
        quantity: 1,
        unitPrice: 8000,
        total: 8000
      }
    ],
    subtotal: 8000,
    tax: 0,
    total: 8000,
    amountPaid: 0,
    status: 'draft',
    paymentStatus: 'unpaid',
    notes: 'Final payment for product photography session to be held on April 20, 2025',
    type: 'final',
    relatedBillId: '3'
  }
];

// Dashboard stats calculation helpers
export const getDashboardStats = (role: 'admin' | 'customer', userId?: string) => {
  let filteredBills = [...mockBills];
  
  // For customers, filter bills by customer ID
  if (role === 'customer' && userId) {
    filteredBills = mockBills.filter(bill => bill.clientId === userId);
  }
  
  const totalBills = filteredBills.length;
  const paidBills = filteredBills.filter(bill => bill.paymentStatus === 'paid').length;
  const partialBills = filteredBills.filter(bill => bill.paymentStatus === 'partial').length;
  const unpaidBills = filteredBills.filter(bill => bill.paymentStatus === 'unpaid').length;
  
  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.amountPaid, 0);
  const pendingRevenue = filteredBills.reduce((sum, bill) => sum + (bill.total - bill.amountPaid), 0);
  
  return {
    totalBills,
    paidBills,
    partialBills,
    unpaidBills,
    totalRevenue,
    pendingRevenue
  };
};