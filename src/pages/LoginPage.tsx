import { useState } from 'react'
import { Heart, LockKeyhole, UserRound } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../auth'
import type { Person } from '../types'

const USERS: Person[] = ['Rebecca', 'Naelly']

export function LoginPage(){
 const [selectedUser,setSelectedUser]=useState<Person>('Rebecca')
 const [busy,setBusy]=useState(false)
 const {signIn}=useAuth()
 const submit=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setBusy(true);const form=new FormData(e.currentTarget);const password=String(form.get('password')||'')
  try{await signIn(selectedUser,password);toast.success(`Acesso liberado para ${selectedUser}.`)}catch(error){toast.error(error instanceof Error?error.message:'Nao foi possivel entrar')}finally{setBusy(false)}}
 return <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#e1ebe3,transparent_38%),radial-gradient(circle_at_bottom_right,#f6e4e2,transparent_40%)] p-4"><div className="w-full max-w-md rounded-[2rem] border border-white bg-white/90 p-7 shadow-2xl backdrop-blur-xl"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sage-700 text-white"><Heart fill="currentColor"/></div><h1 className="mt-5 text-center font-display text-3xl font-bold">Acesso pessoal</h1><p className="mt-2 text-center text-sm text-slate-500">Escolha quem vai usar o app e digite a senha.</p>
 <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2">{USERS.map((user)=><button key={user} type="button" onClick={()=>setSelectedUser(user)} className={`rounded-xl py-3 text-sm font-semibold transition ${selectedUser===user?'bg-white text-sage-700 shadow-sm':'text-slate-500'}`}><span className="inline-flex items-center gap-2"><UserRound size={16}/>{user}</span></button>)}</div>
 <form className="mt-6 space-y-4" onSubmit={submit}><label><span className="label">Senha</span><div className="relative"><LockKeyhole className="absolute left-3 top-3 text-slate-400" size={18}/><input name="password" className="field pl-10" type="password" placeholder="Digite a senha" required/></div></label><button disabled={busy} className="btn-primary mt-2 w-full">{busy?'Aguarde...':'Entrar'}</button></form><p className="mt-5 text-center text-xs leading-5 text-slate-400">Acesso local no aparelho. Sem conta, sem e-mail e sem cadastro.</p></div></div>
}
