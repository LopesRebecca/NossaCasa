import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { type Person } from './types'

export type LocalUser = {name: Person}
type AuthState={user:LocalUser|null;loading:boolean;signIn:(name:Person,password:string)=>Promise<void>;signOut:()=>Promise<void>}

const AuthContext=createContext<AuthState|null>(null)
const AUTH_KEY='nossa-casa:auth:v1'
const BASIC_PASSWORD='Maria123!'

export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<LocalUser|null>(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    try{
      const saved=localStorage.getItem(AUTH_KEY)
      if(saved){
        const parsed=JSON.parse(saved) as Partial<LocalUser>
        if(parsed.name==='Rebecca'||parsed.name==='Naelly') setUser({name:parsed.name})
      }
    }catch{
      localStorage.removeItem(AUTH_KEY)
    }finally{
      setLoading(false)
    }
  },[])

  const value=useMemo(()=>({
    user,
    loading,
    signIn:async(name:Person,password:string)=>{
      if(password!==BASIC_PASSWORD) throw new Error('Senha incorreta')
      const next={name}
      localStorage.setItem(AUTH_KEY,JSON.stringify(next))
      setUser(next)
    },
    signOut:async()=>{
      localStorage.removeItem(AUTH_KEY)
      setUser(null)
    },
  }),[user,loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
export const useAuth=()=>{const value=useContext(AuthContext);if(!value)throw new Error('AuthProvider ausente');return value}
