export const money=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0)
export const shortDate=(v:string)=>v?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(v+'T12:00:00')):'—'
export const uid=()=>crypto.randomUUID()
export const cn=(...v:(string|false|undefined)[])=>v.filter(Boolean).join(' ')
export const fileNameFromUrl=(value:string)=>{
  if(!value)return 'Arquivo'
  try{
    const url=new URL(value)
    return decodeURIComponent(url.pathname.split('/').filter(Boolean).pop()||'Arquivo')
  }catch{
    return decodeURIComponent(value.split('/').filter(Boolean).pop()||'Arquivo')
  }
}
