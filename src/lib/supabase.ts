import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Check if environment variables contain placeholder values
if (supabaseUrl.includes('your_supabase_project_url') || supabaseAnonKey.includes('your_supabase_anon_key')) {
  console.error('❌ Please update your .env file with actual Supabase credentials')
  throw new Error('Please update your .env file with actual Supabase credentials.')
}

console.log('✅ Supabase client initialized')
console.log('🔗 Supabase URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'lenspro-rentals'
    }
  }
})

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...')
    const { data, error } = await supabase
      .from('equipments')
      .select('count(*)')
      .limit(1)
    
    if (error) {
      console.error('❌ Connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Connection test error:', error)
    return false
  }
}

// Database types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  created_at: string
}

export interface Equipment {
  id: string
  name: string
  image_url: string
  rate_12hr: number
  rate_24hr: number
  available: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  equipment_id: string
  duration: '12hr' | '24hr'
  total_cost: number
  rent_date: string
  return_date: string
  created_at: string
  user?: User
  equipment?: Equipment
}

export interface Suggestion {
  id: string
  suggestion_text: string
  suggested_by: string | null
  created_at: string
}

// Database operations
export const db = {
  // Test connection
  async testConnection() {
    return await testConnection()
  },

  // Users
  async getUsers() {
    console.log('📋 Fetching users...')
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching users:', error)
        throw error
      }
      console.log(`✅ Fetched ${data?.length || 0} users`)
      return data as User[]
    } catch (error) {
      console.error('❌ Database error in getUsers:', error)
      throw error
    }
  },

  async updateUser(id: string, updates: Partial<User>) {
    console.log('🔄 Updating user:', id)
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error updating user:', error)
        throw error
      }
      console.log('✅ User updated successfully')
      return data as User
    } catch (error) {
      console.error('❌ Database error in updateUser:', error)
      throw error
    }
  },

  // Equipment
  async getEquipment() {
    console.log('📦 Fetching available equipment...')
    try {
      // First test the connection
      const connectionOk = await testConnection()
      if (!connectionOk) {
        throw new Error('Unable to connect to database')
      }

      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('available', true)
        .order('name')
      
      if (error) {
        console.error('❌ Error fetching equipment:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log(`✅ Fetched ${data?.length || 0} available equipment items`)
      return data as Equipment[]
    } catch (error) {
      console.error('❌ Database error in getEquipment:', error)
      throw error
    }
  },

  async getAllEquipment() {
    console.log('📦 Fetching all equipment...')
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('❌ Error fetching all equipment:', error)
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }
      
      console.log(`✅ Fetched ${data?.length || 0} equipment items`)
      return data as Equipment[]
    } catch (error) {
      console.error('❌ Database error in getAllEquipment:', error)
      throw error
    }
  },

  async createEquipment(equipment: Omit<Equipment, 'id' | 'created_at'>) {
    console.log('➕ Creating equipment:', equipment.name)
    try {
      const { data, error } = await supabase
        .from('equipments')
        .insert(equipment)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error creating equipment:', error)
        throw error
      }
      console.log('✅ Equipment created successfully')
      return data as Equipment
    } catch (error) {
      console.error('❌ Database error in createEquipment:', error)
      throw error
    }
  },

  async updateEquipment(id: string, updates: Partial<Equipment>) {
    console.log('🔄 Updating equipment:', id)
    try {
      const { data, error } = await supabase
        .from('equipments')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error updating equipment:', error)
        throw error
      }
      console.log('✅ Equipment updated successfully')
      return data as Equipment
    } catch (error) {
      console.error('❌ Database error in updateEquipment:', error)
      throw error
    }
  },

  async deleteEquipment(id: string) {
    console.log('🗑️ Deleting equipment:', id)
    try {
      const { error } = await supabase
        .from('equipments')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('❌ Error deleting equipment:', error)
        throw error
      }
      console.log('✅ Equipment deleted successfully')
    } catch (error) {
      console.error('❌ Database error in deleteEquipment:', error)
      throw error
    }
  },

  // Orders
  async getOrders() {
    console.log('📋 Fetching orders...')
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(*),
          equipment:equipments(*)
        `)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching orders:', error)
        throw error
      }
      console.log(`✅ Fetched ${data?.length || 0} orders`)
      return data as Order[]
    } catch (error) {
      console.error('❌ Database error in getOrders:', error)
      throw error
    }
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at'>) {
    console.log('➕ Creating order for equipment:', order.equipment_id)
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select(`
          *,
          user:users(*),
          equipment:equipments(*)
        `)
        .single()
      
      if (error) {
        console.error('❌ Error creating order:', error)
        throw error
      }
      console.log('✅ Order created successfully')
      return data as Order
    } catch (error) {
      console.error('❌ Database error in createOrder:', error)
      throw error
    }
  },

  // Suggestions
  async getSuggestions() {
    console.log('💡 Fetching suggestions...')
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching suggestions:', error)
        throw error
      }
      console.log(`✅ Fetched ${data?.length || 0} suggestions`)
      return data as Suggestion[]
    } catch (error) {
      console.error('❌ Database error in getSuggestions:', error)
      throw error
    }
  },

  async createSuggestion(suggestion: Omit<Suggestion, 'id' | 'created_at'>) {
    console.log('➕ Creating suggestion...')
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .insert(suggestion)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error creating suggestion:', error)
        throw error
      }
      console.log('✅ Suggestion created successfully')
      return data as Suggestion
    } catch (error) {
      console.error('❌ Database error in createSuggestion:', error)
      throw error
    }
  },

  async deleteSuggestion(id: string) {
    console.log('🗑️ Deleting suggestion:', id)
    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('❌ Error deleting suggestion:', error)
        throw error
      }
      console.log('✅ Suggestion deleted successfully')
    } catch (error) {
      console.error('❌ Database error in deleteSuggestion:', error)
      throw error
    }
  }
}