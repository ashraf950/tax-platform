import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDB } from './store'
import { Page, Stat } from './ui'
import { eur } from './data'
export default function VatNew({ annual }) {
  const { me, addCase } = useDB(); const nav = useNavigate()
  const [freq, setFreq] = useState(me.freq || 'quarterly'); const [month, setMonth] = useState('2026-09'); const [q, setQ] = useState('Q3'); const [yr, setYr] = useState('2026'); const [rows, setRows] = useState([])
  const period = annual ? `Financial year ${yr}` : freq === 'monthly' ? new Date(month + '-01').toLocaleString('en-GB', { month: 'long', year: 'numeric' }) : `${q} ${yr}`
  const add = fl => setRows(r => [...r, ...[...fl].map((x, i) => ({ id: Date.now() + i, name: x.name, kind: 'sales', net: '', rate: 21 }))])
  const set = (id, k, v) => setRows(r => r.map(x => x.id === id ? { ...x, [k]: v } : x))
  const sum = k => rows.filter(r => r.kind === k).reduce((a, r) => a + (parseFloat(r.net) || 0) * r.rate / 100, 0)
  const out = sum('sales'), inp = sum('expense'); const bad = r => (parseFloat(r.net) > 0 ? '' : 'Amount missing'); const issues = rows.filter(bad).length
  const submit = () => nav('/case/' + addCase({ type: annual ? 'annual' : 'vat', ownerId: me.id, ownerName: me.company || me.name, status: 'SUBMITTED', period, data: { rows, out, inp, vat: me.vat } }))
  return (
    <Page title={annual ? 'Annual account filing' : 'VAT filing'} sub={annual ? 'Upload all invoices and expenses for the 12 months. Your accountant prepares the annual accounts.' : `${me.company}, ${me.vat}. Choose the period and upload everything at once.`}>
      <div className="card form row">
        {!annual && <label>How often<select value={freq} onChange={e => setFreq(e.target.value)}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select></label>}
        {!annual && freq === 'monthly' && <label>Month<input type="month" value={month} onChange={e => setMonth(e.target.value)} /></label>}
        {!annual && freq === 'quarterly' && <label>Quarter<select value={q} onChange={e => setQ(e.target.value)}>{['Q1', 'Q2', 'Q3', 'Q4'].map(x => <option key={x}>{x}</option>)}</select></label>}
        {(annual || freq === 'quarterly') && <label>{annual ? 'Financial year' : 'Year'}<select value={yr} onChange={e => setYr(e.target.value)}><option>2025</option><option>2026</option></select></label>}
      </div>
      <div className="drop" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); add(e.dataTransfer.files) }}>Drag and drop all sales invoices and expenses for {period} here, or <input type="file" multiple onChange={e => add(e.target.files)} /></div>
      {rows.length > 0 && <><p className="note">Reading amounts from invoices automatically needs the backend. For now, enter or correct the amounts here.</p>
        <div className="tw"><table><thead><tr><th>File</th><th>Type</th><th>Net amount</th><th>VAT rate</th><th>Check</th></tr></thead><tbody>{rows.map(r => <tr key={r.id}><td>{r.name}</td>
          <td><select value={r.kind} onChange={e => set(r.id, 'kind', e.target.value)}><option value="sales">Sales invoice</option><option value="expense">Expense</option></select></td>
          <td><input value={r.net} onChange={e => set(r.id, 'net', e.target.value)} /></td>
          <td><select value={r.rate} onChange={e => set(r.id, 'rate', +e.target.value)}>{[21, 12, 6, 0].map(x => <option key={x} value={x}>{x}%</option>)}</select></td><td>{bad(r) ? <span className="chip bad">{bad(r)}</span> : <span className="chip ok">OK</span>}</td></tr>)}</tbody></table></div>
        <div className="stats"><Stat label="VAT charged on sales" value={eur(out)} /><Stat label="VAT paid on expenses" value={eur(inp)} /><Stat label="Estimated VAT to pay" value={eur(out - inp)} hint="Your accountant confirms the final amount" /></div>
        {issues > 0 && <p className="err">{issues} document(s) need an amount before you can send.</p>}<button className="btn primary" disabled={issues > 0} onClick={submit}>Send to my accountant</button></>}
    </Page>)
}
