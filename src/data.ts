import type { AppData, Person, Priority, ShoppingItem } from './types'
const id=()=>crypto.randomUUID()
const roomItems: Record<string,string[]> = {
  'Sala':['Sofá','Rack ou painel','TV','Cortina','Tapete','Mesa de centro','Almofadas','Decoração'],
  'Cozinha':['Geladeira','Fogão ou cooktop','Micro-ondas','Air fryer','Jogo de panelas','Pratos','Copos','Talheres','Potes organizadores','Lixeira','Panos de prato'],
  'Quarto do casal':['Cama','Colchão','Guarda-roupa','Criados-mudos','Cortina','Jogo de cama','Travesseiros','Cabides','Espelho'],
  'Banheiro':['Espelho','Armário','Lixeira','Tapete','Toalhas','Porta-shampoo','Suporte de papel','Organizadores'],
  'Lavanderia':['Máquina de lavar','Cesto de roupa','Varal','Baldes','Panos','Produtos de limpeza','Armário de limpeza'],
  'Escritório':['Mesa','Cadeira confortável','Luminária','Filtro de linha','Organizadores','Prateleiras','Apoio para notebook/monitor'],
  'Área externa':['Mesa externa','Cadeiras','Plantas','Iluminação','Churrasqueira','Itens de jardim'],
  'Geral':['Kit básico de ferramentas','Extensão','Escada','Caixa organizadora','Lâmpadas extras','Fechaduras','Itens de segurança']
}
export const rooms=Object.keys(roomItems)
const categoryFor=(name:string)=> /TV|Geladeira|Fogão|Micro|Air fryer|Máquina/.test(name)?'Eletrodoméstico':/Sofá|Rack|Mesa|Cama|Guarda|Armário|Cadeira|Prateleira/.test(name)?'Móvel':/Cortina|Tapete|Almofada|Espelho|Plantas|Iluminação|Decoração/.test(name)?'Decoração':'Utensílio'
const shopping:ShoppingItem[]=Object.entries(roomItems).flatMap(([room,names])=>names.map((name,i)=>({id:id(),name,room,category:categoryFor(name),estimated:0,actual:0,store:'',link:'',priority:(i<2?'Alta':i<5?'Média':'Baixa') as Priority,status:'Quero comprar',purchased:false,owner:'As duas' as Person,purchaseDate:'',notes:''})))
const reserveGoalId=id(); const movingGoalId=id()
const today=new Date(); const date=(days:number)=>{const d=new Date(today);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
export const initialData:AppData={
  house:{name:'Casa RN',address:'Pintombeira',city:'Limoeiro do Norte',neighborhood:'Pintombeira',lotSize:'10 x 25 m',builtSize:'—',type:'Casa',seller:'',sellerContact:'',value:280000,downPayment:56000,deliveryDate:date(120),status:'Em análise',notes:'Nosso novo começo. 🏡'},
  shopping,
  financing:{bank:'Caixa Econômica Federal',type:'SAC',propertyValue:280000,financedValue:224000,downPayment:56000,installmentsCount:360,annualRate:9.8,monthlyRate:0.78,amortizationSystem:'SAC',contractDate:'',firstDueDate:date(12),dueDay:10,firstValue:2410,currentValue:2385,currentBalance:221440,currentNumber:3,status:'Em pagamento',contractUrl:'',notes:'Valores demonstrativos e totalmente editáveis.'},
  installments:[
    {id:id(),number:1,dueDate:date(-50),value:2410,interest:1747,amortization:622,fees:41,balance:223378,status:'Paga',paymentDate:date(-51),receipt:'',notes:''},
    {id:id(),number:2,dueDate:date(-20),value:2398,interest:1734,amortization:622,fees:42,balance:222756,status:'Paga',paymentDate:date(-20),receipt:'',notes:''},
    {id:id(),number:3,dueDate:date(6),value:2385,interest:1721,amortization:622,fees:42,balance:222134,status:'Pendente',paymentDate:'',receipt:'',notes:''},
    {id:id(),number:4,dueDate:date(36),value:2374,interest:1709,amortization:622,fees:43,balance:221512,status:'Pendente',paymentDate:'',receipt:'',notes:''}
  ],
  events:[
    {id:id(),title:'Entregar documentos para Caixa',category:'Caixa',date:date(3),time:'09:00',owner:'Rebecca',status:'Pendente',priority:'Alta',notes:'Levar originais e cópias.'},
    {id:id(),title:'Assinar contrato',category:'Caixa',date:date(12),time:'14:00',owner:'As duas',status:'Pendente',priority:'Alta',notes:''},
    {id:id(),title:'Ir ao cartório',category:'Cartório',date:date(20),time:'10:30',owner:'As duas',status:'Pendente',priority:'Média',notes:'Registro do imóvel.'},
    {id:id(),title:'Agendar mudança',category:'Mudança',date:date(90),time:'08:00',owner:'Namorada',status:'Pendente',priority:'Baixa',notes:''}
  ],
  savingsGoals:[
    {id:reserveGoalId,name:'Reserva da casa',target:30000,deadline:date(180),category:'Reserva de emergência',priority:'Alta',notes:'Segurança para os primeiros meses na casa.'},
    {id:movingGoalId,name:'Mudança e primeiros gastos',target:8000,deadline:date(90),category:'Mudança',priority:'Média',notes:'Frete, instalações e compras urgentes.'}
  ],
  savingsTransactions:[
    {id:id(),description:'Depósito inicial',type:'Depósito',amount:5000,date:date(-45),goalId:reserveGoalId,responsible:'As duas',notes:''},
    {id:id(),description:'Economia do mês',type:'Depósito',amount:1800,date:date(-15),goalId:reserveGoalId,responsible:'Rebecca',notes:''},
    {id:id(),description:'Fundo para mudança',type:'Depósito',amount:1200,date:date(-7),goalId:movingGoalId,responsible:'Namorada',notes:''}
  ],
  documents:[
    {id:id(),name:'RG e CPF',category:'Pessoal',status:'Aprovado',sentDate:date(-5),expiryDate:'',owner:'As duas',file:'',notes:''},
    {id:id(),name:'Comprovante de renda',category:'Caixa',status:'Enviado',sentDate:date(-2),expiryDate:'',owner:'Rebecca',file:'',notes:''},
    {id:id(),name:'Contrato Caixa',category:'Caixa',status:'Pendente',sentDate:'',expiryDate:'',owner:'As duas',file:'',notes:''},
    {id:id(),name:'Matrícula do imóvel',category:'Imóvel',status:'Pendente',sentDate:'',expiryDate:'',owner:'Namorada',file:'',notes:''}
  ],
  inspirations:[
    {id:id(),title:'Sala natural e aconchegante',room:'Sala',category:'Decoração',image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80',priority:'Alta',status:'Gostamos',notes:'Madeira clara, linho e plantas.'},
    {id:id(),title:'Cozinha funcional em tons claros',room:'Cozinha',category:'Móveis planejados',image:'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=900&q=80',priority:'Média',status:'Talvez',notes:'Bancada livre e boa iluminação.'},
    {id:id(),title:'Quarto calmo e minimalista',room:'Quarto do casal',category:'Decoração',image:'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80',priority:'Alta',status:'Gostamos',notes:'Paleta bege com verde suave.'}
  ]
}
