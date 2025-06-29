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
    const maxRetries = 2

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...')
        
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('❌ Supabase configuration missing. Please check your .env file.')
          toast.error('Supabase configuration missing. Please check your .env file.')
          if (mounted) {
            setLoading(false)
          }
          return
        }

        if (supabaseUrl.includes('your_supabase_project_url') || supabaseKey.includes('your_supabase_anon_key')) {
          console.error('❌ Please update your .env file with actual Supabase credentials.')
          toast.error('Please update your .env file with actual Supabase credentials.')
          if (mounted) {
            setLoading(false)
          }
          return
        }
        
        // Get initial session with shorter timeout and better error handling
        try {
          const sessionPromise = supabase.auth.getSession()
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session timeout')), 10000) // Reduced to 10 seconds
          )
          
          const { data: { session }, error } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any
          
          if (error) {
            console.error('❌ Session error:', error)
            throw error
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
        } catch (sessionError) {
          console.warn('⚠️ Session initialization failed, continuing without session:', sessionError)
          
          // If session fails, still allow the app to work without authentication
          if (mounted) {
            setSession(null)
            setUser(null)
            setLoading(false)
          }
          
          // Only show error toast if it's not a timeout and we haven't retried
          if (sessionError instanceof Error && 
              sessionError.message === 'Session timeout' && 
              retryCount === 0) {
            console.log('🔄 Session timeout, will retry in background...')
            // Don't show error toast immediately, try once more
            throw sessionError
          } else if (!(sessionError instanceof Error && sessionError.message === 'Session timeout')) {
            toast.error('Unable to connect to authentication service. Some features may be limited.')
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        
        if (mounted && retryCount < maxRetries) {
          retryCount++
          console.log(`🔄 Retrying auth initialization (${retryCount}/${maxRetries})...`)
          setTimeout(initializeAuth, 2000) // Reduced retry delay
        } else if (mounted) {
          // Final fallback - allow app to work without auth
          setSession(null)
          setUser(null)
          setLoading(false)
          
          if (error instanceof Error && error.message === 'Session timeout') {
            console.warn('⚠️ Authentication service unavailable, continuing in offline mode')
            // Don't show error toast for timeout after retries - just log it
          } else {
            toast.error('Authentication service unavailable. Please check your connection.')
          }
        }
      }
    }

    initializeAuth()

    // Listen for auth changes with error handling
    let subscription: any
    try {
      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('🔄 Auth state change:', event)
          
          if (!mounted) return

          try {
            setSession(session)
            if (session?.user) {
              await loadUserProfile(session.user.id)
            } else {
              setUser(null)
              setLoading(false)
            }
          } catch (error) {
            console.error('❌ Error handling auth state change:', error)
            setUser(null)
            setLoading(false)
          }
        }
      )
      subscription = authSubscription
    } catch (error) {
      console.error('❌ Error setting up auth listener:', error)
      if (mounted) {
        setLoading(false)
      }
    }

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const loadUserProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 2
    
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
          console.log(`⏳ User profile not found, retrying in 1s (${retryCount + 1}/${maxRetries})...`)
          setTimeout(() => loadUserProfile(userId, retryCount + 1), 1000)
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
        setTimeout(() => loadUserProfile(userId, retryCount + 1), 1000)
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