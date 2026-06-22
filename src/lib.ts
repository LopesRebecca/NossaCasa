export const money=(v:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v||0)
export const shortDate=(v:string)=>v?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(v+'T12:00:00')):'—'
export const uid=()=>crypto.randomUUID()
export const cn=(...v:(string|false|undefined)[])=>v.filter(Boolean).join(' ')
