import React, { createContext, useContext, useState, useEffect } from 'react';
import { Equipment } from '../lib/supabase';

export interface CartItem {
  equipment: Equipment;
  duration: '12hr' | '24hr';
  rentDate: string;
  returnDate: string;
  quantity: number;
  totalCost: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (equipment: Equipment, duration: '12hr' | '24hr', rentDate: string, returnDate: string) => void;
  removeFromCart: (equipmentId: string) => void;
  updateQuantity: (equipmentId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalCost: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('lenspro-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('lenspro-cart', JSON.stringify(items));
  }, [items]);

  const calculateCost = (equipment: Equipment, duration: '12hr' | '24hr', quantity: number = 1): number => {
    const rate = duration === '12hr' ? equipment.rate_12hr : equipment.rate_24hr;
    return rate * quantity;
  };

  const addToCart = (equipment: Equipment, duration: '12hr' | '24hr', rentDate: string, returnDate: string) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.equipment.id === equipment.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          duration,
          rentDate,
          returnDate,
          quantity: updatedItems[existingItemIndex].quantity + 1,
          totalCost: calculateCost(equipment, duration, updatedItems[existingItemIndex].quantity + 1)
        };
        return updatedItems;
      } else {
        // Add new item
        const newItem: CartItem = {
          equipment,
          duration,
          rentDate,
          returnDate,
          quantity: 1,
          totalCost: calculateCost(equipment, duration, 1)
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (equipmentId: string) => {
    setItems(prevItems => prevItems.filter(item => item.equipment.id !== equipmentId));
  };

  const updateQuantity = (equipmentId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(equipmentId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.equipment.id === equipmentId
          ? {
              ...item,
              quantity,
              totalCost: calculateCost(item.equipment, item.duration, quantity)
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalCost = (): number => {
    return items.reduce((total, item) => total + item.totalCost, 0);
  };

  const getItemCount = (): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalCost,
    getItemCount
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};