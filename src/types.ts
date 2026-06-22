export type Priority = 'Alta' | 'Média' | 'Baixa'
export type Person = 'Rebecca' | 'Naelly' | 'As duas'
export type ItemStatus = 'Quero comprar' | 'Pesquisando' | 'Comprado' | 'Entregue' | 'Montado'
export interface House { name:string; address:string; city:string; neighborhood:string; lotSize:string; builtSize:string; type:string; seller:string; sellerContact:string; value:number; downPayment:number; deliveryDate:string; status:string; notes:string; joinCode:string }
export interface ShoppingItem { id:string; name:string; room:string; category:string; estimated:number; actual:number; store:string; link:string; priority:Priority; status:ItemStatus; purchased:boolean; owner:Person; purchaseDate:string; notes:string }
export interface Installment { id:string; number:number; dueDate:string; value:number; interest:number; amortization:number; fees:number; balance:number; status:'Pendente'|'Paga'|'Atrasada'|'Parcial'; paymentDate:string; receipt:string; notes:string }
export interface Financing { bank:string; type:string; propertyValue:number; financedValue:number; downPayment:number; installmentsCount:number; annualRate:number; monthlyRate:number; amortizationSystem:string; contractDate:string; firstDueDate:string; dueDay:number; firstValue:number; currentValue:number; currentBalance:number; currentNumber:number; status:string; contractUrl:string; notes:string }
export interface ScheduleEvent { id:string; title:string; category:string; date:string; time:string; owner:Person; status:string; priority:Priority; notes:string }
export interface SavingsGoal { id:string; name:string; target:number; deadline:string; category:string; priority:Priority; notes:string }
export interface SavingsTransaction { id:string; description:string; type:'Depósito'|'Retirada'; amount:number; date:string; goalId:string; responsible:Person; notes:string }
export interface HouseDocument { id:string; name:string; category:string; status:string; sentDate:string; expiryDate:string; owner:Person; file:string; notes:string }
export interface Inspiration { id:string; title:string; room:string; category:string; image:string; priority:Priority; status:string; notes:string }
export interface ChecklistItem { id:string; title:string; category:string; completed:boolean; owner:Person; dueDate:string; priority:Priority; notes:string; position:number }
export interface AppData { house:House; shopping:ShoppingItem[]; financing:Financing; installments:Installment[]; events:ScheduleEvent[]; savingsGoals:SavingsGoal[]; savingsTransactions:SavingsTransaction[]; documents:HouseDocument[]; inspirations:Inspiration[]; checklist:ChecklistItem[] }
