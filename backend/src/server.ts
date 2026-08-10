import 'dotenv/config'
import express from 'express'
import mongoose, { Types } from 'mongoose'
import cors from 'cors'
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { generateFinancialAdvice } from './services/aiService.js'
import User from './models/User.js'
import Debt from './models/Debt.js'
import { authenticate, type AuthRequest } from './middleware/auth.js'

const app = express()
const PORT = Number(process.env.PORT || 3000)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker'
const JWT_SECRET = process.env.JWT_SECRET || ''
const categories = ['food','transport','shopping','entertainment','bills','health','education','travel','other']

app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

const userField = { userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true } }
const expenseSchema = new mongoose.Schema({ ...userField, amount:{type:Number,required:true,min:0.01}, category:{type:String,required:true,enum:categories}, description:{type:String,required:true,trim:true}, date:{type:Date,required:true,default:Date.now} }, {timestamps:true})
const incomeSchema = new mongoose.Schema({ ...userField, amount:{type:Number,required:true,min:0.01}, source:{type:String,required:true,trim:true}, description:{type:String,trim:true,default:''}, date:{type:Date,required:true,default:Date.now} }, {timestamps:true})
const budgetSchema = new mongoose.Schema({ ...userField, category:{type:String,required:true,enum:categories}, amount:{type:Number,required:true,min:0.01}, month:{type:Number,required:true,min:1,max:12}, year:{type:Number,required:true} }, {timestamps:true})
const Expense = mongoose.models.Expense || mongoose.model('Expense', expenseSchema)
const Income = mongoose.models.Income || mongoose.model('Income', incomeSchema)
const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema)

const scrypt=promisify(scryptCb)
function base64url(input:string|Buffer){return Buffer.from(input).toString('base64url')}
function tokenFor(userId:string){const header=base64url(JSON.stringify({alg:'HS256',typ:'JWT'}));const payload=base64url(JSON.stringify({userId,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+7*24*60*60}));const sig=createHmac('sha256',JWT_SECRET).update(`${header}.${payload}`).digest('base64url');return `${header}.${payload}.${sig}`}
async function hashPassword(password:string){const salt=randomBytes(16);const derived=await scrypt(password,salt,64) as Buffer;return `${salt.toString('base64')}:${derived.toString('base64')}`}
async function checkPassword(password:string,stored:string){const [salt,hash]=stored.split(':');if(!salt||!hash)return false;const derived=await scrypt(password,Buffer.from(salt,'base64'),64) as Buffer;const expected=Buffer.from(hash,'base64');return expected.length===derived.length&&timingSafeEqual(expected,derived)}
function id(userId?: string) { return new Types.ObjectId(userId) }
function cleanUser(user: any) { return { id: user._id.toString(), name:user.name, email:user.email, currentBankBalance:user.currentBankBalance, createdAt:user.createdAt } }

app.get('/api/health', (_req,res)=>res.json({status:'ok',message:'Backend is running'}))

app.post('/api/auth/register', async (req,res)=>{
  try {
    if (!JWT_SECRET) return res.status(500).json({message:'JWT_SECRET is not configured on the server'})
    const {name,email,password,currentBankBalance=0}=req.body
    if (!name?.trim() || name.trim().length<2) return res.status(400).json({message:'Name must contain at least 2 characters'})
    const normalized=String(email||'').trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalized)) return res.status(400).json({message:'Enter a valid email address'})
    if (typeof password!=='string' || password.length<6) return res.status(400).json({message:'Password must be at least 6 characters'})
    const balance=Number(currentBankBalance)
    if (!Number.isFinite(balance) || balance<0) return res.status(400).json({message:'Current bank balance must be 0 or greater'})
    if (await User.exists({email:normalized})) return res.status(409).json({message:'An account with this email already exists'})
    const hashed=await hashPassword(password)
    const user=await User.create({name:name.trim(),email:normalized,password:hashed,currentBankBalance:balance})
    res.status(201).json({token:tokenFor(user._id.toString()),user:cleanUser(user)})
  } catch(e:any) { console.error(e); res.status(500).json({message:'Failed to register account'}) }
})

app.post('/api/auth/login', async (req,res)=>{
  try {
    if (!JWT_SECRET) return res.status(500).json({message:'JWT_SECRET is not configured on the server'})
    const email=String(req.body.email||'').trim().toLowerCase(), password=String(req.body.password||'')
    const user=await User.findOne({email})
    if (!user || !(await checkPassword(password,user.password))) return res.status(401).json({message:'Invalid email or password'})
    res.json({token:tokenFor(user._id.toString()),user:cleanUser(user)})
  } catch(e) { console.error(e); res.status(500).json({message:'Failed to login'}) }
})

app.get('/api/auth/me', authenticate, async (req:AuthRequest,res)=>{
  const user=await User.findById(req.userId)
  if (!user) return res.status(404).json({message:'User not found'})
  res.json({user:cleanUser(user)})
})

app.put('/api/auth/profile', authenticate, async (req:AuthRequest,res)=>{
  try {
    const updates:any={}
    if (req.body.name!==undefined) { if(String(req.body.name).trim().length<2) return res.status(400).json({message:'Name must contain at least 2 characters'}); updates.name=String(req.body.name).trim() }
    if (req.body.currentBankBalance!==undefined) { const b=Number(req.body.currentBankBalance); if(!Number.isFinite(b)||b<0) return res.status(400).json({message:'Current bank balance must be 0 or greater'}); updates.currentBankBalance=b }
    const user=await User.findByIdAndUpdate(req.userId,updates,{new:true,runValidators:true})
    if(!user) return res.status(404).json({message:'User not found'})
    res.json({user:cleanUser(user)})
  } catch(e){console.error(e);res.status(500).json({message:'Failed to update profile'})}
})

app.post('/api/auth/change-password', authenticate, async (req:AuthRequest,res)=>{
  try {
    const {currentPassword,newPassword}=req.body
    if(typeof newPassword!=='string'||newPassword.length<6)return res.status(400).json({message:'New password must be at least 6 characters'})
    const user=await User.findById(req.userId); if(!user)return res.status(404).json({message:'User not found'})
    if(!(await checkPassword(String(currentPassword||''),user.password)))return res.status(401).json({message:'Current password is incorrect'})
    user.password=await hashPassword(newPassword); await user.save(); res.json({message:'Password changed successfully'})
  } catch(e){console.error(e);res.status(500).json({message:'Failed to change password'})}
})

app.get('/api/expenses',authenticate,async(req:AuthRequest,res)=>{try{res.json(await Expense.find({userId:id(req.userId)}).sort({date:-1}))}catch(e){console.error(e);res.status(500).json({message:'Failed to fetch expenses'})}})
app.get('/api/expenses/:id',authenticate,async(req:AuthRequest,res)=>{try{const x=await Expense.findOne({_id:req.params.id,userId:id(req.userId)});if(!x)return res.status(404).json({message:'Expense not found'});res.json(x)}catch(e){res.status(500).json({message:'Failed to fetch expense'})}})
app.post('/api/expenses',authenticate,async(req:AuthRequest,res)=>{try{const {amount,category,description,date}=req.body;if(Number(amount)<=0)return res.status(400).json({message:'Amount must be greater than 0'});if(!categories.includes(category))return res.status(400).json({message:'Valid category is required'});if(!description?.trim())return res.status(400).json({message:'Description is required'});const x=await Expense.create({userId:id(req.userId),amount:Number(amount),category,description:description.trim(),date:date||new Date()});res.status(201).json(x)}catch(e){console.error(e);res.status(500).json({message:'Failed to create expense'})}})
app.put('/api/expenses/:id',authenticate,async(req:AuthRequest,res)=>{try{const {amount,category,description,date}=req.body;if(Number(amount)<=0||!categories.includes(category)||!description?.trim())return res.status(400).json({message:'Valid amount, category and description are required'});const x=await Expense.findOneAndUpdate({_id:req.params.id,userId:id(req.userId)},{amount:Number(amount),category,description:description.trim(),date:date||new Date()},{new:true,runValidators:true});if(!x)return res.status(404).json({message:'Expense not found'});res.json(x)}catch(e){console.error(e);res.status(500).json({message:'Failed to update expense'})}})
app.delete('/api/expenses/:id',authenticate,async(req:AuthRequest,res)=>{try{const x=await Expense.findOneAndDelete({_id:req.params.id,userId:id(req.userId)});if(!x)return res.status(404).json({message:'Expense not found'});res.json({message:'Expense deleted successfully'})}catch(e){res.status(500).json({message:'Failed to delete expense'})}})
app.get('/api/expenses/summary/categories',authenticate,async(req:AuthRequest,res)=>{try{res.json(await Expense.aggregate([{$match:{userId:id(req.userId)}},{$group:{_id:'$category',total:{$sum:'$amount'}}},{$project:{_id:0,category:'$_id',total:1}},{$sort:{total:-1}}]))}catch(e){res.status(500).json({message:'Failed to fetch category summary'})}})
app.get('/api/expenses/summary/monthly',authenticate,async(req:AuthRequest,res)=>{try{res.json(await Expense.aggregate([{$match:{userId:id(req.userId)}},{$group:{_id:{year:{$year:'$date'},month:{$month:'$date'}},total:{$sum:'$amount'}}},{$sort:{'_id.year':-1,'_id.month':-1}},{$project:{_id:0,year:'$_id.year',month:'$_id.month',total:1}}]))}catch(e){res.status(500).json({message:'Failed to fetch monthly summary'})}})

app.get('/api/income',authenticate,async(req:AuthRequest,res)=>{try{res.json(await Income.find({userId:id(req.userId)}).sort({date:-1}))}catch(e){res.status(500).json({message:'Failed to fetch income'})}})
app.get('/api/income/:id',authenticate,async(req:AuthRequest,res)=>{try{const x=await Income.findOne({_id:req.params.id,userId:id(req.userId)});if(!x)return res.status(404).json({message:'Income not found'});res.json(x)}catch(e){res.status(500).json({message:'Failed to fetch income'})}})
app.post('/api/income',authenticate,async(req:AuthRequest,res)=>{try{const {amount,source,description,date}=req.body;if(Number(amount)<=0)return res.status(400).json({message:'Amount must be greater than 0'});if(!source?.trim())return res.status(400).json({message:'Income source is required'});const x=await Income.create({userId:id(req.userId),amount:Number(amount),source:source.trim(),description:description?.trim()||'',date:date||new Date()});res.status(201).json(x)}catch(e){res.status(500).json({message:'Failed to create income'})}})
app.put('/api/income/:id',authenticate,async(req:AuthRequest,res)=>{try{const {amount,source,description,date}=req.body;if(Number(amount)<=0||!source?.trim())return res.status(400).json({message:'Valid amount and source are required'});const x=await Income.findOneAndUpdate({_id:req.params.id,userId:id(req.userId)},{amount:Number(amount),source:source.trim(),description:description?.trim()||'',date:date||new Date()},{new:true,runValidators:true});if(!x)return res.status(404).json({message:'Income not found'});res.json(x)}catch(e){res.status(500).json({message:'Failed to update income'})}})
app.delete('/api/income/:id',authenticate,async(req:AuthRequest,res)=>{try{const x=await Income.findOneAndDelete({_id:req.params.id,userId:id(req.userId)});if(!x)return res.status(404).json({message:'Income not found'});res.json({message:'Income deleted successfully'})}catch(e){res.status(500).json({message:'Failed to delete income'})}})
app.get('/api/income/summary',authenticate,async(req:AuthRequest,res)=>{try{const r=await Income.aggregate([{$match:{userId:id(req.userId)}},{$group:{_id:null,total:{$sum:'$amount'}}}]);res.json({total:r[0]?.total||0})}catch(e){res.status(500).json({message:'Failed to fetch income summary'})}})

app.get('/api/budgets',authenticate,async(req:AuthRequest,res)=>{try{res.json(await Budget.find({userId:id(req.userId)}).sort({year:-1,month:-1}))}catch(e){res.status(500).json({message:'Failed to fetch budgets'})}})
app.post('/api/budgets',authenticate,async(req:AuthRequest,res)=>{try{const {category,amount,month,year}=req.body;if(!categories.includes(category)||Number(amount)<=0)return res.status(400).json({message:'Valid category and budget amount are required'});const x=await Budget.create({userId:id(req.userId),category,amount:Number(amount),month:Number(month),year:Number(year)});res.status(201).json(x)}catch(e){res.status(500).json({message:'Failed to create budget'})}})
app.put('/api/budgets/:id',authenticate,async(req:AuthRequest,res)=>{try{const {category,amount,month,year}=req.body;const x=await Budget.findOneAndUpdate({_id:req.params.id,userId:id(req.userId)},{category,amount:Number(amount),month:Number(month),year:Number(year)},{new:true,runValidators:true});if(!x)return res.status(404).json({message:'Budget not found'});res.json(x)}catch(e){res.status(500).json({message:'Failed to update budget'})}})
app.delete('/api/budgets/:id',authenticate,async(req:AuthRequest,res)=>{try{const x=await Budget.findOneAndDelete({_id:req.params.id,userId:id(req.userId)});if(!x)return res.status(404).json({message:'Budget not found'});res.json({message:'Budget deleted successfully'})}catch(e){res.status(500).json({message:'Failed to delete budget'})}})
app.get('/api/budgets/spending',authenticate,async(req:AuthRequest,res)=>{try{const month=Number(req.query.month),year=Number(req.query.year);const budgets=await Budget.find({userId:id(req.userId),month,year}).lean();const start=new Date(year,month-1,1),end=new Date(year,month,1);const spending=await Expense.aggregate([{$match:{userId:id(req.userId),date:{$gte:start,$lt:end}}},{$group:{_id:'$category',spent:{$sum:'$amount'}}}]);const map=new Map(spending.map((x:any)=>[x._id,x.spent]));res.json(budgets.map((b:any)=>{const spent=map.get(b.category)||0;return {category:b.category,budget:b.amount,spent,remaining:b.amount-spent,percentage:b.amount?(spent/b.amount)*100:0}}))}catch(e){res.status(500).json({message:'Failed to fetch budget spending'})}})

app.get('/api/debts',authenticate,async(req:AuthRequest,res)=>{try{res.json(await Debt.find({userId:id(req.userId)}).sort({status:1,date:-1}))}catch(e){res.status(500).json({message:'Failed to fetch money owed'})}})
app.post('/api/debts',authenticate,async(req:AuthRequest,res)=>{try{const {person,amount,type,description,date,dueDate}=req.body;if(!person?.trim())return res.status(400).json({message:'Person name is required'});if(!['lent','borrowed'].includes(type))return res.status(400).json({message:'Debt type must be lent or borrowed'});if(Number(amount)<=0)return res.status(400).json({message:'Amount must be greater than 0'});const x=await Debt.create({userId:id(req.userId),person:person.trim(),amount:Number(amount),type,description:description?.trim()||'',date:date||new Date(),dueDate:dueDate||undefined});res.status(201).json(x)}catch(e){res.status(500).json({message:'Failed to create record'})}})
app.put('/api/debts/:id',authenticate,async(req:AuthRequest,res)=>{try{const {person,amount,type,description,date,dueDate,status}=req.body;if(!person?.trim()||Number(amount)<=0||!['lent','borrowed'].includes(type)||!['pending','settled'].includes(status))return res.status(400).json({message:'Invalid money-owed details'});const x=await Debt.findOneAndUpdate({_id:req.params.id,userId:id(req.userId)},{person:person.trim(),amount:Number(amount),type,description:description?.trim()||'',date:date||new Date(),dueDate:dueDate||undefined,status},{new:true,runValidators:true});if(!x)return res.status(404).json({message:'Record not found'});res.json(x)}catch(e){res.status(500).json({message:'Failed to update record'})}})
app.patch('/api/debts/:id/settle',authenticate,async(req:AuthRequest,res)=>{try{const x=await Debt.findOneAndUpdate({_id:req.params.id,userId:id(req.userId),status:'pending'},{status:'settled'},{new:true});if(!x)return res.status(404).json({message:'Pending record not found'});res.json(x)}catch(e){res.status(500).json({message:'Failed to settle record'})}})
app.delete('/api/debts/:id',authenticate,async(req:AuthRequest,res)=>{try{const x=await Debt.findOneAndDelete({_id:req.params.id,userId:id(req.userId)});if(!x)return res.status(404).json({message:'Record not found'});res.json({message:'Record deleted successfully'})}catch(e){res.status(500).json({message:'Failed to delete record'})}})
app.get('/api/debts/summary',authenticate,async(req:AuthRequest,res)=>{try{const r=await Debt.aggregate([{$match:{userId:id(req.userId),status:'pending'}},{$group:{_id:'$type',total:{$sum:'$amount'}}}]);const out:any={lent:0,borrowed:0};for(const x of r)out[x._id]=x.total;out.net=out.lent-out.borrowed;res.json(out)}catch(e){res.status(500).json({message:'Failed to fetch summary'})}})

app.get('/api/ai/insights',authenticate,async(req:AuthRequest,res)=>{try{const expenses=await Expense.find({userId:id(req.userId)}).sort({date:-1}).lean();res.json(await generateFinancialAdvice(expenses as any))}catch(e:any){console.error(e);res.status(500).json({message:'Failed to generate financial insights',error:e?.message||String(e)})}})

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(e => console.error('MongoDB connection error:', e))

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`)
  })
}

export default app