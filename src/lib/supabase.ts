import { createClient } from '@supabase/supabase-js';

// Environment variable validation with better error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set in environment variables');
  console.log('Please add VITE_SUPABASE_URL to your .env file');
}

if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in environment variables');
  console.log('Please add VITE_SUPABASE_ANON_KEY to your .env file');
}

// Create Supabase client with proper configuration
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'lenspro-rentals@1.0.0'
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

// Enhanced connection test with detailed diagnostics
export const testConnection = async () => {
  try {
    // Check environment variables first
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') {
      return { 
        success: false, 
        message: 'Supabase URL not configured. Please set VITE_SUPABASE_URL in your environment variables.',
        details: 'Missing or invalid VITE_SUPABASE_URL'
      };
    }

    if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
      return { 
        success: false, 
        message: 'Supabase anon key not configured. Please set VITE_SUPABASE_ANON_KEY in your environment variables.',
        details: 'Missing or invalid VITE_SUPABASE_ANON_KEY'
      };
    }

    // Test database connection
    console.log('🔄 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('equipments')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return { 
        success: false, 
        message: `Database connection failed: ${error.message}`,
        details: error.details || error.hint || 'Check your Supabase configuration'
      };
    }
    
    console.log('✅ Supabase connection successful');
    return { 
      success: true, 
      message: 'Connected to Supabase successfully',
      details: 'Database is accessible and responding'
    };
  } catch (error: any) {
    console.error('❌ Connection test error:', error);
    return { 
      success: false, 
      message: `Connection error: ${error.message || 'Unknown error'}`,
      details: 'Network or configuration issue'
    };
  }
};

// Enhanced equipment service with better error handling
export const equipmentService = {
  async getAll() {
    try {
      console.log('📦 Fetching equipment...');
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('available', true)
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching equipment:', error);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} equipment items`);
      return data as Equipment[];
    } catch (error: any) {
      console.error('❌ Equipment service error:', error);
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
      console.error('❌ Error fetching equipment by ID:', error);
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
      console.error('❌ Error creating equipment:', error);
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
      console.error('❌ Error updating equipment:', error);
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
      console.error('❌ Error deleting equipment:', error);
      throw new Error(`Failed to delete equipment: ${error.message}`);
    }
  }
};

// Enhanced order service
export const orderService = {
  async getAll() {
    try {
      console.log('📋 Fetching orders...');
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          equipment:equipments(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} orders`);
      return data as Order[];
    } catch (error: any) {
      console.error('❌ Order service error:', error);
      throw new Error(`Failed to load orders: ${error.message}`);
    }
  },

  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) {
    try {
      console.log('➕ Creating new order...');
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select(`
          *,
          equipment:equipments(*)
        `)
        .single();
      
      if (error) {
        console.error('❌ Error creating order:', error);
        throw error;
      }
      
      console.log('✅ Order created successfully');
      return data as Order;
    } catch (error: any) {
      console.error('❌ Order creation error:', error);
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
      console.error('❌ Error updating order:', error);
      throw new Error(`Failed to update order: ${error.message}`);
    }
  }
};

// Enhanced suggestion service
export const suggestionService = {
  async getAll() {
    try {
      console.log('💡 Fetching suggestions...');
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error fetching suggestions:', error);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} suggestions`);
      return data as Suggestion[];
    } catch (error: any) {
      console.error('❌ Suggestion service error:', error);
      throw new Error(`Failed to load suggestions: ${error.message}`);
    }
  },

  async create(suggestion: Omit<Suggestion, 'id' | 'created_at'>) {
    try {
      console.log('➕ Creating new suggestion...');
      const { data, error } = await supabase
        .from('suggestions')
        .insert(suggestion)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating suggestion:', error);
        throw error;
      }
      
      console.log('✅ Suggestion created successfully');
      return data as Suggestion;
    } catch (error: any) {
      console.error('❌ Suggestion creation error:', error);
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
      console.error('❌ Error updating suggestion:', error);
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
      console.error('❌ Error deleting suggestion:', error);
      throw new Error(`Failed to delete suggestion: ${error.message}`);
    }
  }
};

// Enhanced user service with better error handling
export const userService = {
  async getAll() {
    try {
      console.log('👥 Fetching users...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
      }
      
      console.log(`✅ Fetched ${data?.length || 0} users`);
      return data as User[];
    } catch (error: any) {
      console.error('❌ User service error:', error);
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
      console.error('❌ Error fetching user by ID:', error);
      throw new Error(`Failed to load user: ${error.message}`);
    }
  },

  async create(user: Omit<User, 'created_at' | 'updated_at'>) {
    try {
      console.log('➕ Creating new user profile...');
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating user:', error);
        throw error;
      }
      
      console.log('✅ User profile created successfully');
      return data as User;
    } catch (error: any) {
      console.error('❌ User creation error:', error);
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
      console.error('❌ Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
};

// Database initialization and health check
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing database connection...');
    
    // Test connection
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      console.error('❌ Database initialization failed:', connectionTest.message);
      return connectionTest;
    }
    
    // Test each table
    const tables = ['equipments', 'orders', 'suggestions', 'users'];
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.error(`❌ Table ${table} not accessible:`, error.message);
        } else {
          console.log(`✅ Table ${table} is accessible`);
        }
      } catch (err) {
        console.error(`❌ Error checking table ${table}:`, err);
      }
    }
    
    console.log('✅ Database initialization complete');
    return { success: true, message: 'Database initialized successfully' };
    
  } catch (error: any) {
    console.error('❌ Database initialization error:', error);
    return { 
      success: false, 
      message: `Database initialization failed: ${error.message}` 
    };
  }
};