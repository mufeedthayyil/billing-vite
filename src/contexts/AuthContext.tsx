import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, User } from '../lib/supabase'
import { Session } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 3

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...')
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        )
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any
        
        if (error) {
          console.error('❌ Session error:', error)
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setSession(session)
          if (session?.user) {
            console.log('✅ Found session, loading user profile...')
            await loadUserProfile(session.user.id)
          } else {
            console.log('ℹ️ No session found')
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mounted && retryCount < maxRetries) {
          retryCount++
          console.log(`🔄 Retrying auth initialization (${retryCount}/${maxRetries})...`)
          setTimeout(initializeAuth, 2000)
        } else if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event)
        
        if (!mounted) return

        setSession(session)
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 3
    
    try {
      console.log('👤 Loading user profile for:', userId)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error loading user profile:', error)
        
        // If user profile doesn't exist, wait a bit and retry (user creation might be in progress)
        if (error.code === 'PGRST116' && retryCount < maxRetries) {
          console.log(`⏳ User profile not found, retrying in 2s (${retryCount + 1}/${maxRetries})...`)
          setTimeout(() => loadUserProfile(userId, retryCount + 1), 2000)
          return
        }
        
        setUser(null)
      } else {
        console.log('✅ User profile loaded:', data.name)
        setUser(data)
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error)
      
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying user profile load (${retryCount + 1}/${maxRetries})...`)
        setTimeout(() => loadUserProfile(userId, retryCount + 1), 2000)
        return
      }
      
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        throw error
      }

      toast.success('Signed in successfully!')
    } catch (error) {
      throw error
    } finally {
      // Don't set loading to false here, let the auth state change handle it
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        throw error
      }

      if (data.user && !data.session) {
        toast.success('Please check your email to verify your account!')
      } else {
        toast.success('Account created successfully!')
      }
    } catch (error) {
      throw error
    } finally {
      // Don't set loading to false here, let the auth state change handle it
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
      throw error
    }
    toast.success('Signed out successfully!')
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}