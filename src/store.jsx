import { createContext, useContext, useEffect, useState } from 'react'
import { LABEL } from './ui'
const K = 'taxdesk-v5'
const seed = { sid: null, cases: [], invoices: [], users: [
  { id: 'acc1', role: 'accountant', name: 'Accountant A', email: 'accountant@demo.be', password: 'demo1234' },
  { id: 'adm1', role: 'admin', name: 'Admin', email: 'admin@demo.be', password: 'demo1234' },
  { id: 'cli1', role: 'individual', name: 'Sophie Martin', first: 'Sophie', email: 'client@demo.be', password: 'demo1234' },
  { id: 'biz1', role: 'company', name: 'Lucas Dubois', first: 'Lucas', company: 'Dubois Design', bizType: 'natural', vat: 'BE0556341916', freq: 'quarterly', peppol: 'later', email: 'freelance@demo.be', password: 'demo1234' }],
  slots: ['2026-10-20T10:00', '2026-10-20T11:00', '2026-10-21T14:30'].map((when, i) => ({ id: 's' + i, accId: 'acc1', when, caseId: null })) }
const load = () => { try { return JSON.parse(localStorage.getItem(K)) || seed } catch { return seed } }
const C = createContext(); export const useDB = () => useContext(C)
export const uid = () => Math.random().toString(36).slice(2, 9)
const A = (p, c, what) => [...(c.audit || []), { at: new Date().toLocaleString('en-GB'), by: p.users.find(u => u.id === p.sid)?.name || 'System', what }]
export function DB({ children }) {
  const [s, setS] = useState(load)
  useEffect(() => { try { localStorage.setItem(K, JSON.stringify(s)) } catch { /* storage unavailable */ } }, [s])
  const upd = (id, f) => p => ({ ...p, cases: p.cases.map(c => c.id === id ? { ...c, ...f } : c) })
  const api = {
    s, me: s.users.find(u => u.id === s.sid),
    signUp: u => { if (s.users.some(x => x.email === u.email)) return 'This email is already registered'; const n = { id: uid(), ...u }; setS(p => ({ ...p, users: [...p.users, n], sid: n.id })) },
    signIn: (email, password) => { const u = s.users.find(x => x.email === email && x.password === password); if (!u) return 'Wrong email or password'; setS(p => ({ ...p, sid: u.id })) },
    signOut: () => setS(p => ({ ...p, sid: null })),
    addUser: u => setS(p => ({ ...p, users: [...p.users, { id: uid(), ...u }] })),
    addCase: c => { const id = uid(); setS(p => ({ ...p, cases: [{ id, accountantId: 'acc1', msgs: [], audit: [{ at: new Date().toLocaleString('en-GB'), by: p.users.find(u => u.id === p.sid)?.name || 'User', what: 'Submitted for review' }], created: new Date().toLocaleDateString('en-GB'), ...c }, ...p.cases] })); return id },
    patch: (id, f, what) => setS(p => { const c = p.cases.find(x => x.id === id); return upd(id, { ...f, audit: A(p, c, what || `Status: ${LABEL[f.status] || 'updated'}`) })(p) }),
    msg: (id, text, status) => setS(p => { const c = p.cases.find(x => x.id === id); return upd(id, { ...(status ? { status } : {}), msgs: [...c.msgs, { from: p.users.find(u => u.id === p.sid).role, text }], audit: A(p, c, status ? `Status: ${LABEL[status]}` : 'Message sent') })(p) }),
    addSlot: (accId, when) => setS(p => ({ ...p, slots: [...p.slots, { id: uid(), accId, when, caseId: null }] })),
    addInvoice: v => setS(p => ({ ...p, invoices: [{ id: uid(), ...v }, ...p.invoices] })),
    patchInvoice: (id, f) => setS(p => ({ ...p, invoices: p.invoices.map(x => x.id === id ? { ...x, ...f } : x) })),
    book: (slotId, caseId) => setS(p => { const sl = p.slots.find(x => x.id === slotId); if (!sl || sl.caseId) return p
      return { ...upd(caseId, { status: 'CONSULTATION_BOOKED', slotId, audit: A(p, p.cases.find(x => x.id === caseId), 'Consultation booked') })(p), slots: p.slots.map(x => x.id === slotId ? { ...x, caseId } : x) } }),
  }
  return <C.Provider value={api}>{children}</C.Provider>
}
