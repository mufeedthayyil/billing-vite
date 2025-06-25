import { createClient } from '@supabase/supabase-js';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fallback for development/testing
const defaultUrl = 'https://placeholder.supabase.co';
const defaultKey = 'placeholder-key';

if (!supabaseUrl && import.meta.env.PROD) {
  console.error('Missing VITE_SUPABASE_URL in production environment');
}

if (!supabaseAnonKey && import.meta.env.PROD) {
  console.error('Missing VITE_SUPABASE_ANON_KEY in production environment');
}

export const supabase = createClient(
  supabaseUrl || defaultUrl,
  supabaseAnonKey || defaultKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'lenspro-rentals'
      }
    }
  }
);

// Database types
export interface Equipment {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  rate_12hr: number;
  rate_24hr: number;
  available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  equipment_id: string;
  duration: '12hr' | '24hr';
  rent_date: string;
  return_date: string;
  total_cost: number;
  handled_by?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  equipment?: Equipment;
}

export interface Suggestion {
  id: string;
  suggestion_text: string;
  suggested_by: string;
  status: 'pending' | 'reviewed' | 'implemented';
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  created_at?: string;
  updated_at?: string;
}

// Test Supabase connection with better error handling
export const testConnection = async () => {
  try {
    // Check if we have valid environment variables
    if (!supabaseUrl || supabaseUrl === defaultUrl) {
      return { 
        success: false, 
        message: 'Supabase URL not configured. Please set VITE_SUPABASE_URL environment variable.' 
      };
    }

    if (!supabaseAnonKey || supabaseAnonKey === defaultKey) {
      return { 
        success: false, 
        message: 'Supabase anon key not configured. Please set VITE_SUPABASE_ANON_KEY environment variable.' 
      };
    }

    // Test actual connection
    const { data, error } = await supabase
      .from('equipments')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return { 
        success: false, 
        message: `Database connection failed: ${error.message}` 
      };
    }
    
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (error: any) {
    console.error('Supabase connection error:', error);
    return { 
      success: false, 
      message: `Connection error: ${error.message || 'Unknown error'}` 
    };
  }
};

// Equipment operations with error handling
export const equipmentService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('available', true)
        .order('name');
      
      if (error) throw error;
      return data as Equipment[];
    } catch (error: any) {
      console.error('Error fetching equipment:', error);
      throw new Error(`Failed to load equipment: ${error.message}`);
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Equipment;
    } catch (error: any) {
      console.error('Error fetching equipment by ID:', error);
      throw new Error(`Failed to load equipment: ${error.message}`);
    }
  },

  async create(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('equipments')
        .insert(equipment)
        .select()
        .single();
      
      if (error) throw error;
      return data as Equipment;
    } catch (error: any) {
      console.error('Error creating equipment:', error);
      throw new Error(`Failed to create equipment: ${error.message}`);
    }
  },

  async update(id: string, equipment: Partial<Equipment>) {
    try {
      const { data, error } = await supabase
        .from('equipments')
        .update({ ...equipment, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Equipment;
    } catch (error: any) {
      console.error('Error updating equipment:', error);
      throw new Error(`Failed to update equipment: ${error.message}`);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('equipments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting equipment:', error);
      throw new Error(`Failed to delete equipment: ${error.message}`);
    }
  }
};

// Order operations
export const orderService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          equipment:equipments(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Order[];
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      throw new Error(`Failed to load orders: ${error.message}`);
    }
  },

  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select(`
          *,
          equipment:equipments(*)
        `)
        .single();
      
      if (error) throw error;
      return data as Order;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message}`);
    }
  },

  async update(id: string, order: Partial<Order>) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ ...order, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select(`
          *,
          equipment:equipments(*)
        `)
        .single();
      
      if (error) throw error;
      return data as Order;
    } catch (error: any) {
      console.error('Error updating order:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }
};

// Suggestion operations
export const suggestionService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Suggestion[];
    } catch (error: any) {
      console.error('Error fetching suggestions:', error);
      throw new Error(`Failed to load suggestions: ${error.message}`);
    }
  },

  async create(suggestion: Omit<Suggestion, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert(suggestion)
        .select()
        .single();
      
      if (error) throw error;
      return data as Suggestion;
    } catch (error: any) {
      console.error('Error creating suggestion:', error);
      throw new Error(`Failed to create suggestion: ${error.message}`);
    }
  },

  async update(id: string, suggestion: Partial<Suggestion>) {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .update(suggestion)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Suggestion;
    } catch (error: any) {
      console.error('Error updating suggestion:', error);
      throw new Error(`Failed to update suggestion: ${error.message}`);
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting suggestion:', error);
      throw new Error(`Failed to delete suggestion: ${error.message}`);
    }
  }
};

// User operations
export const userService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as User[];
    } catch (error: any) {
      console.error('Error fetching users:', error);
      throw new Error(`Failed to load users: ${error.message}`);
    }
  },

  async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as User;
    } catch (error: any) {
      console.error('Error fetching user by ID:', error);
      throw new Error(`Failed to load user: ${error.message}`);
    }
  },

  async create(user: Omit<User, 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  },

  async update(id: string, user: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...user, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as User;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
};