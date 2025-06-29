import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff' | 'customer'
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
  // Equipment
  async getEquipment() {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .eq('available', true)
      .order('name')
    
    if (error) throw error
    return data as Equipment[]
  },

  async getAllEquipment() {
    const { data, error } = await supabase
      .from('equipments')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data as Equipment[]
  },

  async createEquipment(equipment: Omit<Equipment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('equipments')
      .insert(equipment)
      .select()
      .single()
    
    if (error) throw error
    return data as Equipment
  },

  async updateEquipment(id: string, updates: Partial<Equipment>) {
    const { data, error } = await supabase
      .from('equipments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as Equipment
  },

  async deleteEquipment(id: string) {
    const { error } = await supabase
      .from('equipments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Orders
  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users(*),
        equipment:equipments(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Order[]
  },

  async createOrder(order: Omit<Order, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select(`
        *,
        user:users(*),
        equipment:equipments(*)
      `)
      .single()
    
    if (error) throw error
    return data as Order
  },

  // Users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as User[]
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as User
  },

  // Suggestions
  async getSuggestions() {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Suggestion[]
  },

  async createSuggestion(suggestion: Omit<Suggestion, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('suggestions')
      .insert(suggestion)
      .select()
      .single()
    
    if (error) throw error
    return data as Suggestion
  },

  async deleteSuggestion(id: string) {
    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}