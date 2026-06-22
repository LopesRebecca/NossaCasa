import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { CalendarDays, CheckCircle2, ClipboardList, Cloud, FileText, Heart, Home, Landmark, Lightbulb, LoaderCircle, LogOut, Menu, PackageOpen, PiggyBank, Settings, X } from 'lucide-react'
import { useState } from 'react'
import { StoreProvider, useStore } from './store'
import { Dashboard } from './pages/Dashboard'
import { HousePage } from './pages/HousePage'
import { FinancingPage } from './pages/FinancingPage'
import { SchedulePage } from './pages/SchedulePage'
import { ShoppingPage } from './pages/ShoppingPage'
import { SavingsPage } from './pages/SavingsPage'
import { DocumentsPage } from './pages/DocumentsPage'
import { InspirationsPage } from './pages/InspirationsPage'
import { LoginPage } from './pages/LoginPage'
import { cn } from './lib'
import { AuthProvider, useAuth } from './auth'
import { isSupabaseConfigured } from './supabase'

const nav=[
  {to:'/',label:'Visão geral',icon:Home}, {to:'/casa',label:'Dados da casa',icon:ClipboardList},
  {to:'/financiamento',label:'Empréstimo Caixa',icon:Landmark}, {to:'/cronograma',label:'Cronograma',icon:CalendarDays},
  {to:'/enxoval',label:'Enxoval',icon:PackageOpen}, {to:'/poupanca',label:'Poupança',icon:PiggyBank},
  {to:'/documentos',label:'Documentos',icon:FileText}, {to:'/inspiracoes',label:'Inspirações',icon:Lightbulb},
]
function Shell(){
  const [mobile,setMobile]=useState(false); const location=useLocation(); const navigate=useNavigate(); const {data,syncing,error}=useStore(); const {user,signOut}=useAuth()
  const active=(to:string)=>to==='/'?location.pathname==='/':location.pathname.startsWith(to)
  return <div className="min-h-screen md:grid md:grid-cols-[250px_1fr]">
    <aside className={cn('fixed inset-y-0 left-0 z-50 w-[280px] border-r bg-[#fbfaf7] p-4 transition-transform md:sticky md:top-0 md:w-auto md:translate-x-0',mobile?'translate-x-0':'-translate-x-full')}>
      <div className="flex items-center justify-between px-2 py-3"><button onClick={()=>navigate('/')} className="flex items-center gap-3 text-left"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-sage-700 text-white"><Heart size={20} fill="currentColor"/></div><div><p className="font-display text-xl font-bold">Nossa Casa</p><p className="text-[11px] text-slate-500">Rebecca & Namorada</p></div></button><button onClick={()=>setMobile(false)} className="p-2 md:hidden"><X/></button></div>
      <nav className="mt-6 space-y-1">{nav.map(({to,label,icon:Icon})=><button key={to} onClick={()=>{navigate(to);setMobile(false)}} className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',active(to)?'bg-sage-100 text-sage-700':'text-slate-600 hover:bg-white hover:text-ink')}><Icon size={18}/>{label}</button>)}</nav>
      <div className="absolute bottom-5 left-4 right-4 rounded-2xl border bg-white p-3"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-sm font-bold text-rose-500">R</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Rebecca</p><p className="text-[11px] text-slate-500">Casa RN</p></div><Settings size={16} className="text-slate-400"/></div></div>
    </aside>
    {mobile&&<button aria-label="Fechar menu" className="fixed inset-0 z-40 bg-slate-900/25 md:hidden" onClick={()=>setMobile(false)}/>} 
    <main className="min-w-0 pb-24 md:pb-8"><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-cream/90 px-4 backdrop-blur-xl md:px-8"><div className="flex items-center gap-3"><button onClick={()=>setMobile(true)} className="rounded-xl border bg-white p-2 md:hidden"><Menu size={20}/></button><div><p className="text-sm font-semibold">{data.house.name}</p><p className="hidden text-xs text-slate-500 sm:block">{data.house.address}, {data.house.city}</p></div></div><div className="flex items-center gap-2">{isSupabaseConfigured&&<span title={error||'Sincronizado com Supabase'} className={cn('hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex',error?'bg-red-50 text-red-700':'bg-sage-100 text-sage-700')}>{syncing?<LoaderCircle size={13} className="animate-spin"/>:error?<Cloud size={13}/>:<CheckCircle2 size={13}/>} {syncing?'Salvando...':error?'Erro de sincronização':'Sincronizado'}</span>}<span className="hidden rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 lg:block">{user?.email}</span><button onClick={async()=>{await signOut();navigate('/')}} className="rounded-xl p-2 text-slate-400 hover:bg-white"><LogOut size={18}/></button></div></header>
      <div className="mx-auto max-w-[1500px] p-4 md:p-8"><Routes><Route path="/" element={<Dashboard/>}/><Route path="/casa" element={<HousePage/>}/><Route path="/financiamento" element={<FinancingPage/>}/><Route path="/cronograma" element={<SchedulePage/>}/><Route path="/enxoval" element={<ShoppingPage/>}/><Route path="/poupanca" element={<SavingsPage/>}/><Route path="/documentos" element={<DocumentsPage/>}/><Route path="/inspiracoes" element={<InspirationsPage/>}/><Route path="/login" element={<LoginPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes></div>
    </main>
    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-5 border-t bg-white/95 px-1 pb-[max(.4rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl md:hidden">{nav.slice(0,5).map(({to,label,icon:Icon})=><button key={to} onClick={()=>navigate(to)} className={cn('flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold',active(to)?'text-sage-700':'text-slate-400')}><Icon size={19}/><span className="max-w-16 truncate">{label.replace('Visão geral','Início').replace('Dados da casa','Casa').replace('Empréstimo Caixa','Caixa')}</span></button>)}</nav>
  </div>
}
function Root(){const {user,loading}=useAuth();if(loading)return <div className="grid min-h-screen place-items-center bg-cream"><LoaderCircle className="animate-spin text-sage-600" size={32}/></div>;if(isSupabaseConfigured&&!user)return <LoginPage/>;return <StoreProvider><Shell/></StoreProvider>}
export default function App(){return <AuthProvider><Root/></AuthProvider>}
