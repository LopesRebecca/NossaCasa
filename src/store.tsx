import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { initialData } from './data'
import type { AppData } from './types'
import { isSupabaseConfigured } from './supabase'
import { useAuth } from './auth'
import { loadOrCreateRemoteData, saveRemoteData, type RemoteContext } from './repository'

type Store={data:AppData;setData:React.Dispatch<React.SetStateAction<AppData>>;reset:()=>void;syncing:boolean;error:string;refresh:()=>Promise<void>}
const Ctx=createContext<Store|null>(null)
const KEY='nossa-casa:data:v2'

export function StoreProvider({children}:{children:ReactNode}){
  const {user}=useAuth()
  const [data,setDataState]=useState<AppData>(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY)||'null');return saved?{...initialData,...saved}:initialData}catch{return initialData}})
  const [loading,setLoading]=useState(isSupabaseConfigured)
  const [syncing,setSyncing]=useState(false)
  const [error,setError]=useState('')
  const contextRef=useRef<RemoteContext|null>(null)
  const queueRef=useRef(Promise.resolve())

  const refresh=async()=>{
    if(!isSupabaseConfigured||!user){setLoading(false);return}
    setLoading(true);setError('')
    try{const remote=await loadOrCreateRemoteData(user);contextRef.current=remote.context;setDataState(remote.data);localStorage.setItem(KEY,JSON.stringify(remote.data))}
    catch(e){setError(e instanceof Error?e.message:'Falha ao carregar os dados')}
    finally{setLoading(false)}
  }
  useEffect(()=>{void refresh()},[user?.id])

  const setData:Store['setData']=(next)=>setDataState(current=>{
    const value=typeof next==='function'?next(current):next
    localStorage.setItem(KEY,JSON.stringify(value))
    if(isSupabaseConfigured&&contextRef.current){
      const context=contextRef.current;setSyncing(true);setError('')
      queueRef.current=queueRef.current.then(async()=>{await saveRemoteData(value,current,context)}).catch(e=>{setError(e instanceof Error?e.message:'Falha ao sincronizar')}).finally(()=>setSyncing(false))
    }
    return value
  })
  const reset=()=>setData(initialData)
  const value=useMemo(()=>({data,setData,reset,syncing,error,refresh}),[data,syncing,error])
  if(loading)return <div className="grid min-h-screen place-items-center bg-cream"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-sage-100 border-t-sage-600"/><p className="mt-4 text-sm font-semibold text-slate-500">Preparando a casa...</p></div></div>
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useStore=()=>{const value=useContext(Ctx);if(!value)throw Error('Store ausente');return value}
