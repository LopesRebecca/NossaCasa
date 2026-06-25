import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialData } from './data'
import type { AppData, Person } from './types'

type Store={data:AppData;setData:React.Dispatch<React.SetStateAction<AppData>>;reset:()=>void;syncing:boolean;error:string;refresh:()=>Promise<void>}
const Ctx=createContext<Store|null>(null)
const KEY='nossa-casa:data:v2'

function cachedData():AppData{
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'null')
    if(!saved)return initialData
    const rename=(value:string):Person=>value==='Namorada'?'Naelly':value as Person
    return {
      ...initialData,...saved,
      house:{...initialData.house,...saved.house},
      rooms:saved.rooms||initialData.rooms,
      shopping:(saved.shopping||initialData.shopping).map((i:any)=>({...i,owner:rename(i.owner)})),
      events:(saved.events||initialData.events).map((i:any)=>({...i,owner:rename(i.owner)})),
      savingsTransactions:(saved.savingsTransactions||initialData.savingsTransactions).map((i:any)=>({...i,responsible:rename(i.responsible)})),
      documents:(saved.documents||initialData.documents).map((i:any)=>({...i,owner:rename(i.owner)})),
      checklist:(saved.checklist||initialData.checklist).map((i:any)=>({...i,owner:rename(i.owner)})),
    }
  }catch{return initialData}
}

export function StoreProvider({children}:{children:ReactNode}){
  const [data,setDataState]=useState<AppData>(cachedData)
  const [syncing]=useState(false)
  const [error]=useState('')
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(data))},[data])
  const setData:Store['setData']=(next)=>setDataState(current=>typeof next==='function'?next(current):next)
  const value=useMemo(()=>({data,setData,reset:()=>setData(initialData),syncing,error,refresh:async()=>{}}),[data,syncing,error])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export const useStore=()=>{const value=useContext(Ctx);if(!value)throw Error('Store ausente');return value}
