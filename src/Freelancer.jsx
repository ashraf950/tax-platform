import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDB } from './store'
import { Chip, Page, Stat, Table } from './ui'
import { eur } from './data'
const vatOf = i => i.net * i.rate / 100
export function Invoices() {
  const { s, me, addInvoice, patchInvoice } = useDB(); const [f, setF] = useState({ dir: 'sales', party: '', peppol: '', no: '', date: '2026-09-15', net: '', rate: 21 })
  const mine = (s.invoices || []).filter(i => i.ownerId === me.id); const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const add = e => { e.preventDefault(); addInvoice({ ...f, net: parseFloat(f.net) || 0, rate: +f.rate, ownerId: me.id, status: f.dir === 'sales' ? 'DRAFT' : 'RECEIVED', no: f.no || `${f.dir === 'sales' ? 'INV' : 'PUR'}-${mine.length + 1}` }); setF({ ...f, party: '', peppol: '', no: '', net: '' }) }
  const send = i => { if (!i.peppol) return patchInvoice(i.id, { status: 'FAILED', note: 'Customer is not on Peppol' }); patchInvoice(i.id, { status: 'SENT_TO_ACCESS_POINT', note: '' }); setTimeout(() => patchInvoice(i.id, { status: 'DELIVERED' }), 1500) }
  return (
    <Page title="Invoices and Peppol" sub="Record every sales invoice and every purchase invoice or expense. They feed your automatic VAT.">
      <form className="card form row" onSubmit={add}>
        <label>Type<select value={f.dir} onChange={e => set('dir', e.target.value)}><option value="sales">Sales invoice I issue</option><option value="purchase">Purchase invoice or expense</option></select></label>
        <label>{f.dir === 'sales' ? 'Customer' : 'Supplier'}<input required value={f.party} onChange={e => set('party', e.target.value)} /></label>
        {f.dir === 'sales' && <label>Customer Peppol ID<input placeholder="0208:0123456789" value={f.peppol} onChange={e => set('peppol', e.target.value)} /></label>}
        <label>Invoice number<input value={f.no} onChange={e => set('no', e.target.value)} /></label>
        <label>Date<input type="date" required value={f.date} onChange={e => set('date', e.target.value)} /></label>
        <label>Net amount<input required value={f.net} onChange={e => set('net', e.target.value)} /></label>
        <label>VAT rate<select value={f.rate} onChange={e => set('rate', e.target.value)}>{[21, 12, 6, 0].map(x => <option key={x} value={x}>{x}%</option>)}</select></label>
        <button className="btn primary">Add</button></form>
      <p className="note">Peppol runs through a certified third-party access point, which charges a fee. This demo simulates it. Delivery does not mean the customer has paid.</p>
      <Table head={['Number', 'Type', 'Party', 'Date', 'Net', 'VAT', 'Status', '']}>{mine.map(i => <tr key={i.id}><td><b>{i.no}</b></td><td>{i.dir}</td><td>{i.party}</td><td>{i.date}</td><td>{eur(i.net)}</td><td>{eur(vatOf(i))}</td>
        <td><Chip s={i.status} />{i.note && <small className="sub"> {i.note}</small>}</td>
        <td>{i.dir === 'sales' && ['DRAFT', 'FAILED'].includes(i.status) && <button className="btn" onClick={() => send(i)}>Send via Peppol</button>}</td></tr>)}</Table>
    </Page>)
}
export function AutoVat() {
  const { s, me, addCase } = useDB(); const nav = useNavigate(); const [freq, setFreq] = useState(me.freq || 'quarterly'); const [month, setMonth] = useState('2026-09'); const [q, setQ] = useState('Q3'); const [ok, setOk] = useState(false)
  const months = freq === 'monthly' ? [month] : { Q1: ['01', '02', '03'], Q2: ['04', '05', '06'], Q3: ['07', '08', '09'], Q4: ['10', '11', '12'] }[q].map(m => '2026-' + m)
  const period = freq === 'monthly' ? new Date(month + '-01').toLocaleString('en-GB', { month: 'long', year: 'numeric' }) : `${q} 2026`
  const inv = (s.invoices || []).filter(i => i.ownerId === me.id && months.some(m => i.date.startsWith(m)) && i.status !== 'FAILED')
  const sum = d => inv.filter(i => i.dir === d).reduce((a, i) => a + vatOf(i), 0); const out = sum('sales'), inp = sum('purchase')
  const file = () => nav('/case/' + addCase({ type: 'autovat', ownerId: me.id, ownerName: me.company || me.name, status: 'FILED', period, ack: 'SANDBOX-' + Date.now().toString(36).toUpperCase(),
    data: { rows: inv.map(i => ({ id: i.id, name: `${i.no} ${i.party}`, kind: i.dir === 'sales' ? 'sales' : 'expense', net: i.net, rate: i.rate })), out, inp, vat: me.vat } }))
  return (
    <Page title="Automatic VAT" sub="VAT is calculated from your recorded invoices. Check it, authorise it, and it is filed through Intervat.">
      <div className="card form row"><label>How often<select value={freq} onChange={e => setFreq(e.target.value)}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option></select></label>
        {freq === 'monthly' ? <label>Month<input type="month" value={month} onChange={e => setMonth(e.target.value)} /></label> : <label>Quarter 2026<select value={q} onChange={e => setQ(e.target.value)}>{['Q1', 'Q2', 'Q3', 'Q4'].map(x => <option key={x}>{x}</option>)}</select></label>}</div>
      <div className="stats"><Stat label={`Invoices in ${period}`} value={inv.length} /><Stat label="VAT charged on sales" value={eur(out)} /><Stat label="VAT paid on purchases" value={eur(inp)} hint="Assumes full recovery" /><Stat label="VAT to pay" value={eur(out - inp)} /></div>
      <div className="card"><label className="chk"><input type="checkbox" checked={ok} onChange={e => setOk(e.target.checked)} />I have checked these figures and authorise XLIT Consulting to file this VAT return through Intervat.</label>
        <button className="btn primary" disabled={!ok || !inv.length} onClick={file}>File VAT (sandbox)</button>
        <p className="note">Sandbox: nothing is sent to the tax authority. Live filing needs registration for the Intervat API and a customer mandate. Your receipt appears in your filings.</p></div>
    </Page>)
}
