import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { LayoutDashboard, FilePlus, Send, Calculator, Receipt, BookOpen, CalendarClock, Users, Landmark, LogOut } from 'lucide-react'
import { DB, useDB } from './store'
import { Page, Stat, StatusChip, Table, caseTitle } from './ui'
import { Landing, SignIn, SignUp } from './Public'
import TaxNew from './Individual'
import VatNew from './Company'
import CaseView from './CaseView'
import { Availability, Admin, CaseTable } from './Staff'
import { Invoices, AutoVat } from './Freelancer'
const NAV = {
  individual: [['/', 'My Personal Taxes', LayoutDashboard], ['/tax/new', 'New tax return', FilePlus]],
  company: [['/', 'Dashboard', LayoutDashboard], ['/invoices', 'Invoices and Peppol', Send], ['/auto-vat', 'Automatic VAT', Calculator]],
  accountant: [['/', 'Case Review Queue', LayoutDashboard], ['/availability', 'My availability', CalendarClock]],
  admin: [['/', 'Admin', Users]],
}
function Home() {
  const { s, me } = useDB()
  if (me.role === 'admin') return <Admin />
  if (me.role === 'accountant') {
    const mine = s.cases.filter(c => c.accountantId === me.id)
    const todo = mine.filter(c => ['SUBMITTED', 'EXPAT_STATUS_CHANGE', 'CONSULTATION_BOOKED', 'APPROVED_BY_CLIENT'].includes(c.status)).length
    return <Page title="Case Review Queue" sub="Cases assigned to you"><div className="stats"><Stat label="Assigned cases" value={mine.length} /><Stat label="Need your action" value={todo} /><Stat label="Filed" value={mine.filter(c => c.status === 'FILED').length} /></div><CaseTable cases={mine} /></Page>
  }
  const mine = s.cases.filter(c => c.ownerId === me.id), co = me.role === 'company'
  const pending = mine.filter(c => ['CLIENT_ACTION_REQUIRED', 'READY_FOR_CONSULTATION', 'PREPARED', 'RETURN_PREPARED'].includes(c.status))
  return (
    <Page title={`Welcome, ${me.first || me.name}`} sub={co ? 'Your business workspace' : 'Your personal tax workspace'}>
      {co && <div className="biz"><div><span>Business</span><b>{me.company || me.name}</b></div><div><span>VAT number</span><b>{me.vat}</b></div><div><span>Filing</span><b>{me.freq}</b></div><div><span>Peppol</span><b>{me.peppol === 'yes' ? 'Requested' : 'Not set up'}</b></div></div>}
      <div className="stats"><Stat label="Pending tasks" value={pending.length} hint={pending.length ? 'Waiting for you' : 'All clear'} /><Stat label="Filings" value={mine.length} /><Stat label="Filed" value={mine.filter(c => c.status === 'FILED').length} /></div>
      {pending.map(c => <Link className="todo" key={c.id} to={'/case/' + c.id}><span>{caseTitle(c)}</span><StatusChip s={c.status} /></Link>)}
      {co ? <div className="svcs">
        <Link className="svc" to="/vat/new"><Receipt /><b>VAT filing</b><span>Pick a period, upload invoices and expenses. Your accountant prepares it.</span></Link>
        <Link className="svc" to="/annual/new"><BookOpen /><b>Annual accounts and tax</b><span>Upload 12 months of records for the financial year.</span></Link>
        <Link className="svc" to="/invoices"><Send /><b>Invoices and automatic VAT</b><span>Create invoices, send by Peppol, file after you authorise.</span></Link></div>
        : <Link className="btn primary big" to="/tax/new">Start my tax return</Link>}
      {me.peppol === 'yes' && <p className="note">You asked to register on Peppol. The connection is set up next, once your company details are verified.</p>}
      <h2>Filing history</h2>{mine.length === 0 && <p className="sub">No filings yet.</p>}
      {mine.length > 0 && <Table head={['Filing', 'Status', '']}>{mine.map(c => <tr key={c.id}><td><b>{caseTitle(c)}</b></td><td><StatusChip s={c.status} /></td><td><Link to={'/case/' + c.id}>Open</Link></td></tr>)}</Table>}
    </Page>)
}
function Shell() {
  const { me, signOut } = useDB()
  if (!me) return (
    <div className="pub"><header><Link to="/" className="logo dark"><Landmark size={22} /> Taxdesk</Link><div><Link to="/signin">Sign in</Link> <Link className="btn primary" to="/signup">Sign up</Link></div></header>
      <Routes><Route path="/" element={<Landing />} /><Route path="/signin" element={<SignIn />} /><Route path="/signup" element={<SignUp />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></div>)
  return (
    <div className="app">
      <aside><div className="logo"><Landmark size={22} /> Taxdesk</div>
        <div className="who"><b>{me.name}</b><span>{me.role}</span></div>
        <nav>{NAV[me.role].map(([to, l, Icon]) => <NavLink key={to} to={to} end><Icon size={18} />{l}</NavLink>)}</nav>
        <button className="out" onClick={signOut}><LogOut size={16} /> Sign out</button></aside>
      <section className="main"><Routes>
        <Route path="/" element={<Home />} /><Route path="/case/:id" element={<CaseView />} />
        {me.role === 'individual' && <Route path="/tax/new" element={<TaxNew />} />}
        {me.role === 'company' && <><Route path="/vat/new" element={<VatNew />} /><Route path="/annual/new" element={<VatNew annual />} /><Route path="/invoices" element={<Invoices />} /><Route path="/auto-vat" element={<AutoVat />} /></>}
        
        {me.role === 'accountant' && <Route path="/availability" element={<Availability />} />}
        <Route path="*" element={<Navigate to="/" replace />} /></Routes></section>
    </div>)
}
export default function App() { return <DB><Shell /></DB> }
