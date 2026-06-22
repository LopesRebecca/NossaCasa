import type { User } from '@supabase/supabase-js'
import { initialData, rooms as defaultRooms } from './data'
import { supabase } from './supabase'
import { uid } from './lib'
import type { AppData, ChecklistItem, Financing, House, HouseDocument, Inspiration, Installment, Person, SavingsGoal, SavingsTransaction, ScheduleEvent, ShoppingItem } from './types'

export type RemoteContext={houseId:string;financingId:string;roomIds:Record<string,string>}
type RemoteState={data:AppData;context:RemoteContext}
const nullable=(value:string)=>value||null
const person=(value:string|null|undefined):Person=>value==='Namorada'?'Naelly':(value||'As duas') as Person
const assert=(error:{message:string}|null)=>{if(error)throw new Error(error.message)}

const houseRow=(h:House)=>({name:h.name,address:h.address,city:h.city,neighborhood:h.neighborhood,lot_size:h.lotSize,built_size:h.builtSize,property_type:h.type,seller:h.seller,seller_contact:h.sellerContact,property_value:h.value,down_payment:h.downPayment,delivery_date:nullable(h.deliveryDate),purchase_status:h.status,notes:h.notes})
const financeRow=(f:Financing,houseId:string)=>({house_id:houseId,bank:f.bank,financing_type:f.type,property_value:f.propertyValue,financed_value:f.financedValue,down_payment:f.downPayment,installments_count:f.installmentsCount,annual_rate:f.annualRate,monthly_rate:f.monthlyRate,amortization_system:f.amortizationSystem,contract_date:nullable(f.contractDate),first_due_date:nullable(f.firstDueDate),due_day:f.dueDay,first_value:f.firstValue,current_value:f.currentValue,current_balance:f.currentBalance,current_number:f.currentNumber,contract_status:f.status,contract_url:f.contractUrl,notes:f.notes})

function toHouse(r:any):House{return {name:r.name,address:r.address||'',city:r.city||'',neighborhood:r.neighborhood||'',lotSize:r.lot_size||'',builtSize:r.built_size||'',type:r.property_type||'Casa',seller:r.seller||'',sellerContact:r.seller_contact||'',value:Number(r.property_value)||0,downPayment:Number(r.down_payment)||0,deliveryDate:r.delivery_date||'',status:r.purchase_status||'Em análise',notes:r.notes||'',joinCode:r.join_code||''}}
function toFinance(r:any):Financing{return {bank:r.bank,type:r.financing_type||'SAC',propertyValue:Number(r.property_value)||0,financedValue:Number(r.financed_value)||0,downPayment:Number(r.down_payment)||0,installmentsCount:r.installments_count||360,annualRate:Number(r.annual_rate)||0,monthlyRate:Number(r.monthly_rate)||0,amortizationSystem:r.amortization_system||'SAC',contractDate:r.contract_date||'',firstDueDate:r.first_due_date||'',dueDay:r.due_day||10,firstValue:Number(r.first_value)||0,currentValue:Number(r.current_value)||0,currentBalance:Number(r.current_balance)||0,currentNumber:r.current_number||0,status:r.contract_status||'Simulação',contractUrl:r.contract_url||'',notes:r.notes||''}}

async function syncRows(table:string,houseId:string,rows:any[]){
  const {data:existing,error:readError}=await supabase!.from(table).select('id').eq('house_id',houseId);assert(readError)
  const keep=new Set(rows.map(r=>r.id));const removed=(existing||[]).map((r:any)=>r.id).filter((id:string)=>!keep.has(id))
  if(removed.length){const {error}=await supabase!.from(table).delete().in('id',removed);assert(error)}
  if(rows.length){const {error}=await supabase!.from(table).upsert(rows);assert(error)}
}

async function ensureRooms(houseId:string,names:string[],known:Record<string,string>){
  const missing=[...new Set(names)].filter(name=>!known[name])
  if(missing.length){const rows=missing.map(name=>({id:uid(),house_id:houseId,name}));const {data,error}=await supabase!.from('rooms').upsert(rows,{onConflict:'house_id,name'}).select();assert(error);for(const row of data||[])known[row.name]=row.id}
  return known
}

async function seedHouse(houseId:string,user:User):Promise<RemoteState>{
  const roomRows=defaultRooms.map(name=>({id:uid(),house_id:houseId,user_id:user.id,name}));let {data:createdRooms,error:roomsError}=await supabase!.from('rooms').insert(roomRows).select();assert(roomsError)
  const roomIds=Object.fromEntries((createdRooms||[]).map((r:any)=>[r.name,r.id]))
  const {data:finance,error:financeError}=await supabase!.from('financing').insert(financeRow(initialData.financing,houseId)).select().single();assert(financeError)
  const context={houseId,financingId:finance.id,roomIds}
  await saveRemoteData(initialData,initialData,context,true)
  return {data:initialData,context}
}

export async function loadOrCreateRemoteData(user:User):Promise<RemoteState>{
  if(!supabase)throw new Error('Supabase não configurado')
  const {data:existing,error}=await supabase.from('houses').select('*').order('created_at',{ascending:true}).limit(1).maybeSingle();assert(error)
  if(!existing){
    const inviteCode=String(user.user_metadata?.join_code||'').trim()
    if(inviteCode){const {error:joinError}=await supabase.rpc('join_house_by_code',{invite_code:inviteCode,member_name:String(user.user_metadata?.name||'Membro')});assert(joinError);return loadOrCreateRemoteData(user)}
    const {data:house,error:houseError}=await supabase.from('houses').insert({...houseRow(initialData.house),created_by:user.id}).select().single();assert(houseError)
    const displayName=String(user.user_metadata?.name||user.email?.split('@')[0]||'Rebecca')
    const {error:memberError}=await supabase.from('house_members').insert({house_id:house.id,user_id:user.id,display_name:displayName,role:'owner'});assert(memberError)
    return seedHouse(house.id,user)
  }
  const houseId=existing.id
  const [financing,installments,roomRows,shopping,events,goals,transactions,documents,inspirations,checklist]=await Promise.all([
    supabase.from('financing').select('*').eq('house_id',houseId).limit(1).maybeSingle(),
    supabase.from('financing_installments').select('*').eq('house_id',houseId).order('installment_number'),
    supabase.from('rooms').select('*').eq('house_id',houseId),
    supabase.from('shopping_items').select('*').eq('house_id',houseId),
    supabase.from('schedule_events').select('*').eq('house_id',houseId),
    supabase.from('savings_goals').select('*').eq('house_id',houseId),
    supabase.from('savings_transactions').select('*').eq('house_id',houseId),
    supabase.from('documents').select('*').eq('house_id',houseId),
    supabase.from('inspirations').select('*').eq('house_id',houseId),
    supabase.from('checklist_items').select('*').eq('house_id',houseId).order('position'),
  ]);[financing,installments,roomRows,shopping,events,goals,transactions,documents,inspirations,checklist].forEach(r=>assert(r.error))
  const roomIds=Object.fromEntries((roomRows.data||[]).map((r:any)=>[r.name,r.id]));const roomNames=Object.fromEntries((roomRows.data||[]).map((r:any)=>[r.id,r.name]))
  if(!financing.data){const {data:f,error:e}=await supabase.from('financing').insert(financeRow(initialData.financing,houseId)).select().single();assert(e);financing.data=f}
  if(!(checklist.data||[]).length){const {data:seeded,error:seedError}=await supabase.from('checklist_items').insert(initialData.checklist.map(i=>({id:i.id,house_id:houseId,title:i.title,category:i.category,completed:i.completed,responsible:i.owner,due_date:nullable(i.dueDate),priority:i.priority,notes:i.notes,position:i.position}))).select();assert(seedError);checklist.data=seeded}
  const data:AppData={
    house:toHouse(existing),financing:toFinance(financing.data),
    installments:(installments.data||[]).map((r:any):Installment=>({id:r.id,number:r.installment_number,dueDate:r.due_date,value:Number(r.value),interest:Number(r.interest),amortization:Number(r.amortization),fees:Number(r.fees),balance:Number(r.balance),status:r.status,paymentDate:r.payment_date||'',receipt:r.receipt_url||'',notes:r.notes||''})),
    shopping:(shopping.data||[]).map((r:any):ShoppingItem=>({id:r.id,name:r.name,room:roomNames[r.room_id]||'Geral',category:r.category||'Outro',estimated:Number(r.estimated_value),actual:Number(r.actual_value)||0,store:r.store||'',link:r.product_url||'',priority:r.priority||'Média',status:r.status,purchased:r.purchased,owner:person(r.responsible),purchaseDate:r.purchase_date||'',notes:r.notes||''})),
    events:(events.data||[]).map((r:any):ScheduleEvent=>({id:r.id,title:r.title,category:r.category||'',date:r.event_date,time:r.event_time?.slice(0,5)||'',owner:person(r.responsible),status:r.status,priority:r.priority||'Média',notes:r.notes||''})),
    savingsGoals:(goals.data||[]).map((r:any):SavingsGoal=>({id:r.id,name:r.name,target:Number(r.target_amount),deadline:r.deadline||'',category:r.category||'',priority:r.priority||'Média',notes:r.notes||''})),
    savingsTransactions:(transactions.data||[]).map((r:any):SavingsTransaction=>({id:r.id,description:r.description,type:r.transaction_type,amount:Number(r.amount),date:r.transaction_date,goalId:r.goal_id||'',responsible:person(r.responsible),notes:r.notes||''})),
    documents:(documents.data||[]).map((r:any):HouseDocument=>({id:r.id,name:r.name,category:r.category||'',status:r.status,sentDate:r.sent_date||'',expiryDate:r.expiry_date||'',owner:person(r.responsible),file:r.file_url||'',notes:r.notes||''})),
    inspirations:(inspirations.data||[]).map((r:any):Inspiration=>({id:r.id,title:r.title,room:r.room||'Geral',category:r.category||'',image:r.image_url||'',priority:r.priority||'Média',status:r.status||'Gostamos',notes:r.notes||''})),
    checklist:(checklist.data||[]).map((r:any):ChecklistItem=>({id:r.id,title:r.title,category:r.category,completed:r.completed,owner:person(r.responsible),dueDate:r.due_date||'',priority:r.priority||'Média',notes:r.notes||'',position:r.position||0}))
  }
  return {data,context:{houseId,financingId:financing.data.id,roomIds}}
}

export async function saveRemoteData(next:AppData,previous:AppData,context:RemoteContext,force=false){
  if(!supabase)return context
  const changed=(key:keyof AppData)=>force||JSON.stringify(next[key])!==JSON.stringify(previous[key])
  if(changed('house')){const {error}=await supabase.from('houses').update(houseRow(next.house)).eq('id',context.houseId);assert(error)}
  if(changed('financing')){const {error}=await supabase.from('financing').update(financeRow(next.financing,context.houseId)).eq('id',context.financingId);assert(error)}
  if(changed('shopping')){
    await ensureRooms(context.houseId,next.shopping.map(i=>i.room),context.roomIds)
    await syncRows('shopping_items',context.houseId,next.shopping.map(i=>({id:i.id,house_id:context.houseId,room_id:context.roomIds[i.room]||null,name:i.name,category:i.category,estimated_value:i.estimated,actual_value:i.actual||null,store:i.store,product_url:i.link,priority:i.priority,status:i.status,purchased:i.purchased,responsible:i.owner,purchase_date:nullable(i.purchaseDate),notes:i.notes})))
  }
  if(changed('installments'))await syncRows('financing_installments',context.houseId,next.installments.map(i=>({id:i.id,house_id:context.houseId,financing_id:context.financingId,installment_number:i.number,due_date:i.dueDate,value:i.value,interest:i.interest,amortization:i.amortization,fees:i.fees,balance:i.balance,status:i.status,payment_date:nullable(i.paymentDate),receipt_url:i.receipt,notes:i.notes})))
  if(changed('events'))await syncRows('schedule_events',context.houseId,next.events.map(i=>({id:i.id,house_id:context.houseId,title:i.title,category:i.category,event_date:i.date,event_time:nullable(i.time),responsible:i.owner,status:i.status,priority:i.priority,notes:i.notes})))
  if(changed('savingsGoals'))await syncRows('savings_goals',context.houseId,next.savingsGoals.map(i=>({id:i.id,house_id:context.houseId,name:i.name,target_amount:i.target,deadline:nullable(i.deadline),category:i.category,priority:i.priority,notes:i.notes})))
  if(changed('savingsTransactions')||changed('savingsGoals'))await syncRows('savings_transactions',context.houseId,next.savingsTransactions.map(i=>({id:i.id,house_id:context.houseId,goal_id:i.goalId||null,description:i.description,transaction_type:i.type,amount:i.amount,transaction_date:i.date,responsible:i.responsible,notes:i.notes})))
  if(changed('documents'))await syncRows('documents',context.houseId,next.documents.map(i=>({id:i.id,house_id:context.houseId,name:i.name,category:i.category,status:i.status,sent_date:nullable(i.sentDate),expiry_date:nullable(i.expiryDate),responsible:i.owner,file_url:i.file,notes:i.notes})))
  if(changed('inspirations'))await syncRows('inspirations',context.houseId,next.inspirations.map(i=>({id:i.id,house_id:context.houseId,title:i.title,room:i.room,category:i.category,image_url:i.image,priority:i.priority,status:i.status,notes:i.notes})))
  if(changed('checklist'))await syncRows('checklist_items',context.houseId,next.checklist.map(i=>({id:i.id,house_id:context.houseId,title:i.title,category:i.category,completed:i.completed,responsible:i.owner,due_date:nullable(i.dueDate),priority:i.priority,notes:i.notes,position:i.position})))
  return context
}
