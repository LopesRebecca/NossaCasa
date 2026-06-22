import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from './supabase'

type AuthState={user:User|null;loading:boolean;signOut:()=>Promise<void>}
const AuthContext=createContext<AuthState|null>(null)

export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<User|null>(null)
  const [loading,setLoading]=useState(isSupabaseConfigured)
  useEffect(()=>{
    if(!supabase){setLoading(false);return}
    supabase.auth.getSession().then(({data})=>{setUser(data.session?.user??null);setLoading(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{setUser(session?.user??null);setLoading(false)})
    return ()=>subscription.unsubscribe()
  },[])
  const value=useMemo(()=>({user,loading,signOut:async()=>{if(supabase)await supabase.auth.signOut()}}),[user,loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth=()=>{const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider ausente');return value}
