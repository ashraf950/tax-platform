import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDB } from './store'
import { Eye, EyeOff, Mail, Lock, UserRound, Briefcase, Building2, GraduationCap, Upload, BadgeCheck, ShieldCheck, ArrowLeft, Landmark, Check, CircleCheck } from 'lucide-react'
export function Landing() {
  const F = [['Upload once', 'Drag and drop all your invoices and expenses. We flag missing amounts straight away.'], ['Prepared by an accountant', 'A real accountant reviews every figure and prepares your return.'], ['You stay in control', 'Nothing is filed until you authorise the exact prepared version.'], ['Proof of filing', 'Keep the official acknowledgement and a full history in one place.']]
  return (<>
    <section className="hero"><div className="hero-in"><div>
      <span className="pill">Built for Belgium</span>
      <h1>Tax and VAT, <em>prepared by real accountants</em></h1>
      <p>Freelancers, companies and individuals upload their documents once. An accountant prepares the return, you approve it, and it gets filed.</p>
      <div className="row"><Link className="btn gold big" to="/signup">Get started</Link><Link className="btn ghost big" to="/signin">Sign in</Link></div></div>
      <div className="mini"><small>Sample VAT overview, Q3 2026</small><b>EUR 159.60</b><span>estimated VAT payable</span>
        <ul><li>Output VAT collected<i>EUR 210.00</i></li><li>Recoverable input VAT<i>EUR 50.40</i></li></ul><div className="tag">Awaiting accountant review</div></div></div></section>
    <section className="feats">{F.map(([t, d], n) => <div className="feat" key={t}><i>{n + 1}</i><b>{t}</b><p>{d}</p></div>)}</section>
  </>)
}
const vatOk = v => { const d = v.toUpperCase().replace(/^BE/, '').replace(/[\s.]/g, ''); return /^[01]\d{9}$/.test(d) && 97 - (+d.slice(0, 8) % 97) === +d.slice(8) }
function Side() {
  return (
    <div className="authside"><Link to="/" className="logo"><Landmark size={24} /> Taxdesk</Link>
      <div><h2>Tax and VAT without the paperwork</h2><p>Upload once. A real accountant prepares it. You approve before anything is filed.</p>
        <ul>{[[Upload, 'Upload documents in minutes'], [BadgeCheck, 'Prepared by qualified accountants'], [ShieldCheck, 'Nothing is filed without your approval']].map(([I, t]) => <li key={t}><I size={18} />{t}</li>)}</ul></div>
      <div className="mini"><small>Sample VAT overview, Q3 2026</small><b>EUR 159.60</b><span>estimated VAT payable</span><div className="tag">Awaiting accountant review</div></div>
    </div>)
}
const Field = ({ icon: I, label, error, children }) => <label className="fld"><span>{label}</span><div className={'fbox' + (error ? ' bad' : '')}><I size={18} />{children}</div>{error && <em>{error}</em>}</label>
const Pick = ({ on, onClick, icon: I, title, hint }) => <button type="button" className={'pick' + (on ? ' on' : '')} onClick={onClick}><span className="pi"><I size={22} /></span><span className="pt"><b>{title}</b>{hint && <small>{hint}</small>}</span><span className="pc">{on && <Check size={15} />}</span></button>
export function SignIn() {
  const { signIn } = useDB(); const nav = useNavigate(); const [e, setE] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState(''); const [show, setShow] = useState(false)
  const go = ev => { ev.preventDefault(); const r = signIn(e.trim(), p); r ? setErr(r) : nav('/') }
  return (
    <div className="authpage"><Side />
      <div className="authmain"><form className="authbox" onSubmit={go}>
        <h1>Welcome back</h1><p className="qsub">Sign in to continue with your tax and VAT filings.</p>
        <Field icon={Mail} label="Email"><input type="email" required autoComplete="email" placeholder="you@company.be" value={e} onChange={x => { setE(x.target.value); setErr('') }} /></Field>
        <Field icon={Lock} label="Password" error={err}><input type={show ? 'text' : 'password'} required autoComplete="current-password" placeholder="Your password" value={p} onChange={x => { setP(x.target.value); setErr('') }} />
          <button type="button" className="eye" aria-label="Show or hide password" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></Field>
        <button className="btn primary big full">Sign in</button>
        <p className="alt">New to Taxdesk? <Link to="/signup">Create an account</Link></p>
        <div className="demo"><small>Demo accounts, password demo1234</small><div>{[['Individual', 'client@demo.be'], ['Business', 'freelance@demo.be'], ['Accountant', 'accountant@demo.be'], ['Admin', 'admin@demo.be']].map(([l, m]) => <button type="button" key={m} onClick={() => { setE(m); setP('demo1234'); setErr('') }}>{l}</button>)}</div></div>
      </form></div></div>)
}
export function SignUp() {
  const { signUp } = useDB(); const nav = useNavigate(); const [i, setI] = useState(0); const [err, setErr] = useState(''); const [show, setShow] = useState(false)
  const [f, setF] = useState({ first: '', last: '', email: '', password: '', terms: false, selfEmployed: '', bizType: '', company: '', vat: '', freq: 'quarterly', occupation: '', peppol: '' })
  const set = (k, v) => { setErr(''); setF(p => ({ ...p, [k]: v })) }
  const biz = f.selfEmployed === 'yes', legal = f.bizType === 'legal'
  const flow = ['name', 'pass', 'self', ...(biz ? ['type', ...(legal ? ['company'] : []), 'vat', ...(legal ? [] : ['occ']), 'peppol'] : [])]
  const step = flow[i], total = f.selfEmployed === 'no' ? 3 : 7
  const score = (f.password.length >= 8) + (f.password.length >= 12) + (/[A-Z]/.test(f.password) && /\d/.test(f.password)) + /[^A-Za-z0-9]/.test(f.password)
  const check = () => {
    if (step === 'name') { if (!f.first.trim() || !f.last.trim()) return 'Please enter your first and last name.'; if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return 'Enter a valid email address.' }
    if (step === 'pass') { if (f.password.length < 8) return 'Use at least 8 characters.'; if (!f.terms) return 'Please accept the terms to continue.' }
    if (step === 'self' && !f.selfEmployed) return 'Choose one option to continue.'
    if (step === 'type' && !f.bizType) return 'Choose your business type.'
    if (step === 'company' && !f.company.trim()) return 'Enter your company name.'
    if (step === 'vat' && !vatOk(f.vat)) return 'This VAT number does not look valid. Check the 10 digits after BE.'
    if ((step === 'occ' && !f.occupation) || (step === 'peppol' && !f.peppol)) return 'Choose one option to continue.'
    return ''
  }
  const finish = () => { const r = signUp({ ...f, role: biz ? 'company' : 'individual', name: `${f.first} ${f.last}`.trim(), email: f.email.trim() }); if (r) { setErr(r); setI(0) } else nav('/') }
  const next = ev => { ev.preventDefault(); const m = check(); if (m) return setErr(m); i === flow.length - 1 ? finish() : setI(i + 1) }
  const T = { name: ["Let's get you started", 'Create your Taxdesk account in about a minute.'], pass: ['Secure your account', 'Choose a strong password.'], self: ['Are you already self-employed?', 'We use this to set up the right workspace for you.'],
    type: ['What kind of business do you have?', 'This decides how your VAT is filed.'], company: ['What is your company called?', 'Use the name registered with the Belgian authorities.'], vat: ['Your VAT details', 'We check the number before you continue.'],
    occ: ['Is this your main occupation?', 'This helps us apply the right tax treatment.'], peppol: ['Send and receive e-invoices?', 'Peppol is the Belgian network for electronic invoices.'] }[step]
  return (
    <div className="authpage"><Side />
      <div className="authmain"><form className="authbox" onSubmit={next}>
        <div className="prog"><div className="progtop">{i > 0 ? <button type="button" className="back" onClick={() => { setErr(''); setI(i - 1) }}><ArrowLeft size={16} /> Back</button> : <span />}<small>Step {i + 1} of {total}</small></div><div className="bar2"><i style={{ width: ((i + 1) / total) * 100 + '%' }} /></div></div>
        <h1>{T[0]}</h1><p className="qsub">{T[1]}</p>
        {step === 'name' && <><div className="two2"><Field icon={UserRound} label="First name"><input autoFocus value={f.first} onChange={e => set('first', e.target.value)} /></Field><Field icon={UserRound} label="Last name"><input value={f.last} onChange={e => set('last', e.target.value)} /></Field></div>
          <Field icon={Mail} label="Email" error={err.includes('mail') || err.includes('registered') ? err : ''}><input type="email" placeholder="you@company.be" value={f.email} onChange={e => set('email', e.target.value)} /></Field></>}
        {step === 'pass' && <><Field icon={Lock} label="Password" error={err.includes('characters') ? err : ''}><input autoFocus type={show ? 'text' : 'password'} value={f.password} onChange={e => set('password', e.target.value)} />
          <button type="button" className="eye" aria-label="Show or hide password" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></Field>
          <div className="meter">{[1, 2, 3].map(n => <i key={n} className={score >= n + (n > 1) ? 'on s' + Math.min(score, 3) : ''} />)}<small>{f.password ? ['Weak', 'Weak', 'Okay', 'Strong', 'Strong'][score] : 'Use 8 or more characters'}</small></div>
          <label className="terms"><input type="checkbox" checked={f.terms} onChange={e => set('terms', e.target.checked)} /><span>I accept the terms and conditions and the privacy policy.</span></label>{err.includes('terms') && <p className="err">{err}</p>}</>}
        {step === 'self' && <div className="picks"><Pick on={f.selfEmployed === 'yes'} onClick={() => set('selfEmployed', 'yes')} icon={Briefcase} title="Yes, I am self-employed" hint="Freelancer, sole trader or company owner" />
          <Pick on={f.selfEmployed === 'no'} onClick={() => set('selfEmployed', 'no')} icon={UserRound} title="No, I need personal tax help" hint="Your personal tax return only" /></div>}
        {step === 'type' && <div className="picks"><Pick on={f.bizType === 'natural'} onClick={() => set('bizType', 'natural')} icon={UserRound} title="Self-employed person" hint="Eenmanszaak, personne physique" />
          <Pick on={f.bizType === 'legal'} onClick={() => set('bizType', 'legal')} icon={Building2} title="Company" hint="BV, SRL, vennootschap, société" /><Pick on={f.bizType === 'student'} onClick={() => set('bizType', 'student')} icon={GraduationCap} title="Student self-employed" /></div>}
        {step === 'company' && <Field icon={Building2} label="Company name"><input autoFocus value={f.company} onChange={e => set('company', e.target.value)} /></Field>}
        {step === 'vat' && <><Field icon={Briefcase} label="VAT number" error={err.includes('VAT') ? err : ''}><input autoFocus placeholder="BE0123456789" value={f.vat} onChange={e => set('vat', e.target.value)} />{vatOk(f.vat) && <CircleCheck size={20} className="okic" />}</Field>
          <p className="lbl">How often do you file VAT?</p><div className="seg2">{[['monthly', 'Monthly'], ['quarterly', 'Quarterly']].map(([k, l]) => <button type="button" key={k} className={f.freq === k ? 'on' : ''} onClick={() => set('freq', k)}>{l}</button>)}</div></>}
        {step === 'occ' && <div className="picks"><Pick on={f.occupation === 'main'} onClick={() => set('occupation', 'main')} icon={Briefcase} title="Yes, full time" hint="This is my main occupation" />
          <Pick on={f.occupation === 'secondary'} onClick={() => set('occupation', 'secondary')} icon={Briefcase} title="No, a secondary activity" hint="Bijberoep, complémentaire" /></div>}
        {step === 'peppol' && <div className="picks"><Pick on={f.peppol === 'yes'} onClick={() => set('peppol', 'yes')} icon={Check} title="Yes please" hint="I want to send and receive e-invoices" />
          <Pick on={f.peppol === 'later'} onClick={() => set('peppol', 'later')} icon={Check} title="Maybe later" hint="You can set up the Peppol connection when you are ready" /></div>}
        {err && !['name', 'pass', 'vat'].includes(step) && <p className="err">{err}</p>}
        <button className="btn primary big full">{i === flow.length - 1 ? 'Create my account' : 'Continue'}</button>
        <p className="alt">Already have an account? <Link to="/signin">Sign in</Link></p>
      </form></div></div>)
}
