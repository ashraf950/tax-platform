import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDB } from './store'
import { Chip, Page, unitFor } from './ui'
const STEPS = ['About you', 'Dependants', 'Income and expat status', 'Tax savings', 'Documents', 'Authorisation']
const CLAIMS = [['childcare', 'Childcare costs', 'Certificate per child'], ['vouchers', 'Service vouchers', 'Annual voucher certificate'], ['pension', 'Pension saving', 'Provider certificate'], ['donations', 'Donations', 'Tax certificates'], ['support', 'Money sent to family abroad', 'Accountant decides if it counts']]
export default function TaxNew() {
  const { me, addCase } = useDB(); const nav = useNavigate(); const [i, setI] = useState(0); const [err, setErr] = useState('')
  const [f, setF] = useState({ address: '', natno: '', civil: 'Single', first: false, prior: false, abroad: false, job: 'Local employee', expat: '', arrival: '', docs: [], declared: false })
  const [deps, setDeps] = useState([]); const [cl, setCl] = useState({})
  const set = (k, v) => setF(p => ({ ...p, [k]: v }))
  const dep = (j, k, v) => setDeps(d => d.map((x, n) => n === j ? { ...x, [k]: v } : x))
  const cc = (id, k, v) => setCl(p => ({ ...p, [id]: { ...p[id], [k]: v } }))
  const [unit, why] = unitFor(f.civil, f.first, f.prior, f.abroad); const partnered = ['Married', 'Legally cohabiting'].includes(f.civil)
  const next = () => {
    if (i === 0 && (!f.address || !f.natno)) return setErr('Enter your address and national number.')
    if (i === 2 && !f.expat) return setErr('Tell us whether you are on an expat regime.')
    if (i === 4 && !f.docs.length) return setErr('Upload at least one document, such as your wage certificate.')
    setErr(''); setI(i + 1) }
  const submit = () => {
    if (!f.declared) return setErr('Tick the authorisation to submit.')
    nav('/case/' + addCase({ type: 'personal', ownerId: me.id, ownerName: me.name, status: 'SUBMITTED', year: 2027, data: { ...f, unit, deps, claims: Object.entries(cl).filter(([, v]) => v.on).map(([id, v]) => ({ id, label: CLAIMS.find(c => c[0] === id)[1], amount: v.amount })) } })) }
  return (
    <Page title="Personal tax return" sub="Income year 2026, assessment year 2027. Your accountant reviews this before your call.">
      <ol className="steps">{STEPS.map((s, n) => <li key={s} className={n < i ? 'done' : n === i ? 'now' : ''}><i>{n + 1}</i>{s}</li>)}</ol>
      <div className="card form">
        {i === 0 && <><label>Address<input value={f.address} onChange={e => set('address', e.target.value)} /></label>
          <label>National number<input value={f.natno} onChange={e => set('natno', e.target.value)} /></label>
          <label>Family status<select value={f.civil} onChange={e => set('civil', e.target.value)}>{['Single', 'Married', 'Legally cohabiting', 'De facto cohabiting', 'Divorced', 'Widowed'].map(x => <option key={x}>{x}</option>)}</select></label>
          {partnered && <><label className="chk"><input type="checkbox" checked={f.first} onChange={e => set('first', e.target.checked)} />Married or registered in 2026</label>
            <label className="chk"><input type="checkbox" checked={f.prior} onChange={e => set('prior', e.target.checked)} />Legally cohabiting with the same partner before</label>
            <label className="chk"><input type="checkbox" checked={f.abroad} onChange={e => set('abroad', e.target.checked)} />My partner lives abroad</label></>}
          <div className="note">Suggested filing unit: <Chip s={unit} /> {why} Your accountant confirms this. A partner is never a dependant.</div></>}
        {i === 1 && <>{deps.map((d, j) => <div className="row" key={j}><input placeholder="Name" value={d.name} onChange={e => dep(j, 'name', e.target.value)} />
          <select value={d.relation} onChange={e => dep(j, 'relation', e.target.value)}>{['Child', 'Parent or relative', 'Other'].map(x => <option key={x}>{x}</option>)}</select>
          <input placeholder="Birth year" value={d.year} onChange={e => dep(j, 'year', e.target.value)} />
          <label className="chk"><input type="checkbox" checked={!!d.shared} onChange={e => dep(j, 'shared', e.target.checked)} />Shared custody</label>
          <button type="button" className="link" onClick={() => setDeps(deps.filter((_, n) => n !== j))}>Remove</button></div>)}
          <button type="button" className="btn" onClick={() => setDeps([...deps, { name: '', relation: 'Child', year: '' }])}>Add a dependant</button>
          <p className="sub">A child can only be claimed in one return. Shared custody is checked by your accountant.</p></>}
        {i === 2 && <><label>Work situation<select value={f.job} onChange={e => set('job', e.target.value)}>{['Local employee', 'Expat on assignment', 'Switched from expat to local job', 'Self-employed'].map(x => <option key={x}>{x}</option>)}</select></label>
          <p>Are you, or were you recently, on an expat or special inbound tax regime?</p>
          {['yes', 'no'].map(v => <label className="chk" key={v}><input type="radio" name="x" checked={f.expat === v} onChange={() => set('expat', v)} />{v === 'yes' ? 'Yes' : 'No'}</label>)}
          {f.expat === 'yes' && <><label>Year you arrived in Belgium<input value={f.arrival} onChange={e => set('arrival', e.target.value)} /></label>
            <p className="note">Expat cases take longer. If you moved from an expat regime to a local job, your accountant must first change your status at the tax office. Upload these proofs.</p>{['Old address proof', 'New address proof', 'Residence permit (RP card)', 'New employer details', 'Social security proof'].map(k => <label key={k}>{k}<input type="file" onChange={e => setF(p => ({ ...p, expatDocs: { ...p.expatDocs, [k]: e.target.files[0]?.name } }))} /></label>)}</>}</>}
        {i === 3 && CLAIMS.map(([id, l, h]) => <div className="claim" key={id}><label className="chk"><input type="checkbox" checked={!!cl[id]?.on} onChange={e => cc(id, 'on', e.target.checked)} />{l}</label><span className="sub">{h}</span>
          {cl[id]?.on && <div className="row"><input placeholder="Amount in EUR" onChange={e => cc(id, 'amount', e.target.value)} /><input type="file" /></div>}</div>)}
        {i === 4 && <><p>Upload your MyMinfin export, wage certificates and proof for the claims. Never share your MyMinfin password.</p>
          <input type="file" multiple onChange={e => set('docs', [...e.target.files].map(x => x.name))} />{f.docs.map(d => <p className="sub" key={d}>{d}</p>)}</>}
        {i === 5 && <><p>Please review your answers, then authorise your accountant.</p>
          <label className="chk"><input type="checkbox" checked={f.declared} onChange={e => set('declared', e.target.checked)} />I authorise XLIT Consulting to prepare and file my tax return for assessment year 2027.</label></>}
        {err && <p className="err">{err}</p>}
        <div className="row">{i > 0 && <button type="button" className="btn" onClick={() => setI(i - 1)}>Back</button>}
          {i < 5 ? <button type="button" className="btn primary" onClick={next}>Continue</button> : <button type="button" className="btn primary" onClick={submit}>Submit for review</button>}</div>
      </div></Page>)
}
