import { useState, type ReactNode } from 'react'
import { X, Plus, Search, Trash2, Pencil, ChevronRight } from 'lucide-react'
import { cn } from './lib'

export function Badge({children,tone='neutral'}:{children:ReactNode;tone?:string}){
  const colors:Record<string,string>={green:'bg-emerald-50 text-emerald-700 ring-emerald-600/10',red:'bg-red-50 text-red-700 ring-red-600/10',yellow:'bg-amber-50 text-amber-700 ring-amber-600/10',blue:'bg-sky-50 text-sky-700 ring-sky-600/10',rose:'bg-rose-50 text-rose-700 ring-rose-600/10',neutral:'bg-slate-100 text-slate-600 ring-slate-500/10'}
  return <span className={cn('inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',colors[tone]||colors.neutral)}>{children}</span>
}
export const statusTone=(v:string)=>/Pago|Paga|Concluído|Comprado|Entregue|Montado|Aprovado|Gostamos|Quitado/.test(v)?'green':/Atrasada|Recusado|Vencido|Cancelado|Descartado/.test(v)?'red':/Pendente|Quero|Orçamento|Talvez/.test(v)?'yellow':'blue'
export const priorityTone=(v:string)=>v==='Alta'?'red':v==='Média'?'yellow':'blue'

export function Metric({label,value,icon,detail,tone='sage'}:{label:string;value:string;icon:ReactNode;detail?:string;tone?:'sage'|'rose'|'blue'|'sand'}){
  const tones={sage:'bg-sage-50 text-sage-700',rose:'bg-rose-50 text-rose-500',blue:'bg-sky-50 text-sky-700',sand:'bg-amber-50 text-amber-700'}
  return <div className="card flex min-h-36 flex-col justify-between"><div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-slate-500">{label}</p><div className={cn('rounded-xl p-2',tones[tone])}>{icon}</div></div><div><p className="mt-4 text-2xl font-bold tracking-tight text-ink">{value}</p>{detail&&<p className="mt-1 text-xs text-slate-500">{detail}</p>}</div></div>
}
export function PageHeader({eyebrow,title,description,action}:{eyebrow?:string;title:string;description:string;action?:ReactNode}){
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div>{eyebrow&&<p className="mb-1 text-xs font-bold uppercase tracking-[.16em] text-sage-500">{eyebrow}</p>}<h1 className="font-display text-3xl font-bold text-ink md:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div>{action}</div>
}
export function Modal({open,onClose,title,children,wide=false}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;wide?:boolean}){
  if(!open)return null
  return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/35 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={cn('max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-cream p-5 shadow-2xl sm:rounded-3xl sm:p-6',wide?'max-w-4xl':'max-w-xl')}><div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl font-bold">{title}</h2><button className="rounded-full p-2 hover:bg-white" onClick={onClose}><X size={20}/></button></div>{children}</div></div>
}
export function Field({label,children}:{label:string;children:ReactNode}){return <label className="block"><span className="label">{label}</span>{children}</label>}
export function FormGrid({children}:{children:ReactNode}){return <div className="grid gap-4 sm:grid-cols-2">{children}</div>}
export function Empty({title='Nada por aqui',description='Adicione o primeiro registro para começar.'}:{title?:string;description?:string}){return <div className="py-14 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sage-50 text-sage-500"><Plus/></div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div>}
export function SearchBox({value,onChange,placeholder='Buscar...'}:{value:string;onChange:(v:string)=>void;placeholder?:string}){return <div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17}/><input className="field pl-9" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>}
export function RowActions({onEdit,onDelete}:{onEdit:()=>void;onDelete:()=>void}){return <div className="flex justify-end gap-1"><button title="Editar" onClick={onEdit} className="rounded-lg p-2 text-slate-500 hover:bg-sage-50 hover:text-sage-700"><Pencil size={16}/></button><button title="Excluir" onClick={onDelete} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16}/></button></div>}
export function QuickLink({icon,title,desc,onClick}:{icon:ReactNode;title:string;desc:string;onClick:()=>void}){return <button onClick={onClick} className="group card flex w-full items-center gap-4 text-left transition hover:-translate-y-0.5 hover:border-sage-100"><div className="rounded-2xl bg-sage-50 p-3 text-sage-700">{icon}</div><div className="min-w-0 flex-1"><p className="font-semibold">{title}</p><p className="mt-0.5 truncate text-xs text-slate-500">{desc}</p></div><ChevronRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-sage-500" size={18}/></button>}
export function AddButton({children='Adicionar',onClick}:{children?:ReactNode;onClick:()=>void}){return <button className="btn-primary" onClick={onClick}><Plus size={17}/>{children}</button>}
export function Tabs({items,value,onChange}:{items:string[];value:string;onChange:(v:string)=>void}){return <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">{items.map(i=><button key={i} onClick={()=>onChange(i)} className={cn('whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition',value===i?'bg-white text-ink shadow-sm':'text-slate-500 hover:text-ink')}>{i}</button>)}</div>}
