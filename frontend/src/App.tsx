import { useEffect, useState } from 'react'
import './App.css'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import IncomePage from './pages/Income'
import Budgets from './pages/Budgets'
import Analytics from './pages/Analytics'
import Auth from './pages/Auth'
import Debts from './pages/Debts'
import { clearToken, getExpenses, getMe, getToken, type Expense, type User } from './services/api'

type Page='dashboard'|'expenses'|'income'|'budgets'|'analytics'|'debts'

function App(){
 const [user,setUser]=useState<User|null>(null); const [checking,setChecking]=useState(true); const [activePage,setActivePage]=useState<Page>('dashboard'); const [expenses,setExpenses]=useState<Expense[]>([]); const [editingExpense,setEditingExpense]=useState<Expense|null>(null); const [refreshTrigger,setRefreshTrigger]=useState(0); const [loadingData,setLoadingData]=useState(false)
 useEffect(()=>{(async()=>{if(!getToken()){setChecking(false);return}try{const r=await getMe();setUser(r.user)}catch{clearToken();setUser(null)}finally{setChecking(false)}})()},[])
 async function loadExpenses(){if(!user)return;try{setLoadingData(true);setExpenses(await getExpenses())}catch(e){console.error(e)}finally{setLoadingData(false)}}
 useEffect(()=>{if(user)loadExpenses()},[user])
 function changed(){setRefreshTrigger(x=>x+1);loadExpenses()}
 function logout(){clearToken();setUser(null);setExpenses([]);setActivePage('dashboard')}
 function renderPage(){switch(activePage){case'dashboard':return <Dashboard expenses={expenses} onExpenseChanged={changed} onEditExpense={e=>{setEditingExpense(e);setActivePage('expenses')}}/>;case'expenses':return <Expenses expenses={expenses} editingExpense={editingExpense} onEditExpense={e=>{setEditingExpense(e)}} onCancelEdit={()=>setEditingExpense(null)} onExpenseChanged={changed}/>;case'income':return <IncomePage/>;case'budgets':return <Budgets refreshTrigger={refreshTrigger}/>;case'analytics':return <Analytics expenses={expenses}/>;case'debts':return <Debts/>}}
 if(checking)return <div className="loading-screen"><div className="loading-card"><div className="loading-spinner"/><h2>Checking your session</h2><p>Securing your financial dashboard...</p></div></div>
 if(!user)return <Auth onAuthenticated={setUser}/>
 return <div className="app-shell"><aside className="sidebar"><div className="brand"><div className="brand-icon">₹</div><div><h1>FinTrack</h1><span>Personal Finance</span></div></div><nav className="sidebar-nav">{([['dashboard','⌂','Dashboard'],['expenses','↗','Expenses'],['income','↙','Income'],['budgets','◫','Budgets'],['debts','⇄','Money Owed'],['analytics','▥','Analytics']] as const).map(([p,icon,label])=><button key={p} className={activePage===p?'nav-item active':'nav-item'} onClick={()=>{setActivePage(p);setEditingExpense(null)}}><span>{icon}</span>{label}</button>)}</nav><div className="sidebar-footer"><div className="status-dot"/><span>System operational</span></div></aside><div className="main-area"><header className="topbar"><div><p className="eyebrow">PERSONAL FINANCE</p><h2>{activePage==='dashboard'?'Dashboard':activePage==='expenses'?'Expenses':activePage==='income'?'Income':activePage==='budgets'?'Budgets':activePage==='debts'?'Money Owed':'Analytics'}</h2></div><div className="topbar-actions"><button className="refresh-button" onClick={changed} title="Refresh data">↻</button><div className="profile"><div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div><div><strong>{user.name}</strong><span>₹{user.currentBankBalance.toLocaleString('en-IN')} bank balance</span></div><button className="logout-button" onClick={logout}>Log out</button></div></div></header><main className="content">{loadingData&&<div className="data-refresh">Refreshing…</div>}{renderPage()}</main></div></div>
}
export default App
