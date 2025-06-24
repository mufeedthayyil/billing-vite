import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Test Supabase connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('equipments').select('count').limit(1);
    if (error) throw error;
    return { success: true, message: 'Connected to Supabase successfully' };
  } catch (error) {
    console.error('Supabase connection error:', error);
    return { success: false, message: 'Failed to connect to Supabase' };
  }
};

// Equipment operations
export const equipmentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .eq('available', true)
      .order('name');
    
    if (error) throw error;
    return data as Equipment[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Equipment;
  },

  async create(equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('equipments')
      .insert(equipment)
      .select()
      .single();
    
    if (error) throw error;
    return data as Equipment;
  },

  async update(id: string, equipment: Partial<Equipment>) {
    const { data, error } = await supabase
      .from('equipments')
      .update({ ...equipment, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Equipment;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('equipments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// Order operations
export const orderService = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        equipment:equipments(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Order[];
  },

  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
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
  },

  async update(id: string, order: Partial<Order>) {
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
  }
};

// Suggestion operations
export const suggestionService = {
  async getAll() {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Suggestion[];
  },

  async create(suggestion: Omit<Suggestion, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('suggestions')
      .insert(suggestion)
      .select()
      .single();
    
    if (error) throw error;
    return data as Suggestion;
  },

  async update(id: string, suggestion: Partial<Suggestion>) {
    const { data, error } = await supabase
      .from('suggestions')
      .update(suggestion)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Suggestion;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// User operations
export const userService = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as User[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async create(user: Omit<User, 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async update(id: string, user: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...user, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }
};