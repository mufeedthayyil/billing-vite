import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
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

// Database Operations
export const db = {
  // Equipment operations
  async getAvailableEquipment(): Promise<Equipment[]> {
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .eq('available', true)
        .order('name')
      
      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Failed to fetch equipment: ${error.message}`)
      }
      
      return data || []
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  },

  async getAllEquipment(): Promise<Equipment[]> {
    try {
      const { data, error } = await supabase
        .from('equipments')
        .select('*')
        .order('name')
      
      if (error) throw new Error(`Failed to fetch equipment: ${error.message}`)
      return data || []
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  },

  async createEquipment(equipment: Omit<Equipment, 'id' | 'created_at'>): Promise<Equipment> {
    const { data, error } = await supabase
      .from('equipments')
      .insert(equipment)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create equipment: ${error.message}`)
    return data
  },

  async updateEquipment(id: string, updates: Partial<Equipment>): Promise<Equipment> {
    const { data, error } = await supabase
      .from('equipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update equipment: ${error.message}`)
    return data
  },

  async deleteEquipment(id: string): Promise<void> {
    const { error } = await supabase
      .from('equipments')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete equipment: ${error.message}`)
  },

  // Order operations
  async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(*),
          equipment:equipments(*)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch orders: ${error.message}`)
      return data || []
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          equipment:equipments(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch user orders: ${error.message}`)
      return data || []
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select(`
        *,
        user:users(*),
        equipment:equipments(*)
      `)
      .single()
    
    if (error) throw new Error(`Failed to create order: ${error.message}`)
    return data
  },

  // User operations
  async getUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch users: ${error.message}`)
      return data || []
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to update user: ${error.message}`)
    return data
  },

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // No rows returned
        throw new Error(`Failed to fetch user profile: ${error.message}`)
      }
      
      return data
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  },

  // Suggestion operations
  async getSuggestions(): Promise<Suggestion[]> {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw new Error(`Failed to fetch suggestions: ${error.message}`)
      return data || []
    } catch (error) {
      console.error('Database error:', error)
      throw error
    }
  },

  async createSuggestion(suggestion: Omit<Suggestion, 'id' | 'created_at'>): Promise<Suggestion> {
    const { data, error } = await supabase
      .from('suggestions')
      .insert(suggestion)
      .select()
      .single()
    
    if (error) throw new Error(`Failed to create suggestion: ${error.message}`)
    return data
  },

  async deleteSuggestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', id)
    
    if (error) throw new Error(`Failed to delete suggestion: ${error.message}`)
  }
}