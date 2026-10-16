import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDB } from './store'
import { Page, StatusChip, Table, fmt, caseTitle } from './ui'
export function CaseTable({ cases }) {
  return <Table head={['Client', 'Type', 'Status', 'Flags', '']}>{cases.map(c => <tr key={c.id}><td><b>{c.ownerName}</b></td><td>{caseTitle(c)}</td><td><StatusChip s={c.status} /></td>
    <td>{c.data.expat === 'yes' && <span className="chip warn">expat</span>}</td><td><Link to={'/case/' + c.id}>Open</Link></td></tr>)}</Table>
}
export function Availability() {
  const { s, me, addSlot } = useDB(); const [w, setW] = useState('')
  return (
    <Page title="My availability" sub="Clients book from these slots. A slot can only be booked once.">
      <div className="card row"><input type="datetime-local" value={w} onChange={e => setW(e.target.value)} /><button className="btn primary" disabled={!w} onClick={() => { addSlot(me.id, w); setW('') }}>Add slot</button></div>
      <Table head={['Time', 'Status']}>{s.slots.filter(x => x.accId === me.id).sort((a, b) => a.when.localeCompare(b.when)).map(x => <tr key={x.id}><td>{fmt(x.when)}</td><td>{x.caseId ? 'Booked' : 'Free'}</td></tr>)}</Table>
    </Page>)
}
export function Admin() {
  const { s, patch, addUser } = useDB(); const [a, setA] = useState({ name: '', email: '', password: '' }); const accs = s.users.filter(u => u.role === 'accountant')
  return (
    <Page title="Admin" sub="Accountants, assignments and all cases">
      <h2>Add an accountant</h2>
      <div className="card row">{['name', 'email', 'password'].map(k => <input key={k} placeholder={k} type={k === 'password' ? 'password' : 'text'} value={a[k]} onChange={e => setA({ ...a, [k]: e.target.value })} />)}
        <button className="btn primary" disabled={!a.name || !a.email || a.password.length < 8} onClick={() => { addUser({ ...a, role: 'accountant' }); setA({ name: '', email: '', password: '' }) }}>Add</button></div>
      <h2>Cases</h2>
      <Table head={['Client', 'Type', 'Status', 'Accountant']}>{s.cases.map(c => <tr key={c.id}><td><b>{c.ownerName}</b></td><td>{c.type}</td><td><StatusChip s={c.status} /></td>
        <td><select value={c.accountantId} onChange={e => patch(c.id, { accountantId: e.target.value })}>{accs.map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></td></tr>)}</Table>
      <h2>Users</h2><Table head={['Name', 'Email', 'Role']}>{s.users.map(u => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td></tr>)}</Table>
    </Page>)
}
