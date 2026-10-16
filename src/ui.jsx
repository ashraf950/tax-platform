import { createContext, useContext, useState } from 'react'
import { purchases0 } from './data'
const Ctx = createContext(); export const useData = () => useContext(Ctx)
export function DataProvider({ children }) {
  const [purchases, setPurchases] = useState(purchases0)
  const [vatState, setVatState] = useState('ESTIMATED')
  const review = (id, recovery) => { setPurchases(p => p.map(x => x.id === id ? { ...x, recovery, status: 'APPROVED' } : x)); setVatState('ESTIMATED') }
  return <Ctx.Provider value={{ purchases, review, vatState, setVatState }}>{children}</Ctx.Provider>
}
const TONE = { ok: ['DELIVERED', 'APPROVED', 'ALREADY_INCLUDED', 'ACCOUNTANT_APPROVED', 'JOINT', 'INDIVIDUAL', 'RETURN_PREPARED'],
  warn: ['NEEDS_REVIEW', 'MORE_EVIDENCE', 'SPECIALIST_REVIEW', 'ESTIMATED', 'UNDER_REVIEW', 'SEPARATE_WITH_PARTNER_BENEFIT_REVIEW'],
  bad: ['FAILED', 'NOT_ELIGIBLE', 'QUARANTINED'], info: ['POTENTIALLY_ELIGIBLE', 'TRANSPORT_ACCEPTED', 'SENT_TO_ACCESS_POINT', 'READY_FOR_CONSULTATION'] }
export const Chip = ({ s }) => <span className={'chip ' + (Object.keys(TONE).find(k => TONE[k].includes(s)) || '')}>{s.replaceAll('_', ' ').toLowerCase()}</span>
export const Page = ({ title, sub, children }) => <div className="page"><h1>{title}</h1>{sub && <p className="sub">{sub}</p>}{children}</div>
export const Stat = ({ label, value, hint }) => <div className="stat"><span>{label}</span><b>{value}</b>{hint && <small>{hint}</small>}</div>
export const Table = ({ head, children }) => <div className="tw"><table><thead><tr>{head.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>
export const LABEL = { SUBMITTED: 'Submitted for review', CLIENT_ACTION_REQUIRED: 'More information needed', EXPAT_STATUS_CHANGE: 'Expat to local status change in progress', READY_FOR_CONSULTATION: 'Ready for consultation', CONSULTATION_BOOKED: 'Consultation booked', RETURN_PREPARED: 'Return prepared', PREPARED: 'Prepared by accountant', APPROVED_BY_CLIENT: 'Approved by client', FILED: 'Filed and confirmed' }
export const FLOW = { personal: ['SUBMITTED', 'READY_FOR_CONSULTATION', 'CONSULTATION_BOOKED', 'RETURN_PREPARED', 'APPROVED_BY_CLIENT', 'FILED'], vat: ['SUBMITTED', 'PREPARED', 'APPROVED_BY_CLIENT', 'FILED'], annual: ['SUBMITTED', 'PREPARED', 'APPROVED_BY_CLIENT', 'FILED'], autovat: ['SUBMITTED', 'FILED'], expat: ['SUBMITTED', 'EXPAT_STATUS_CHANGE', 'READY_FOR_CONSULTATION', 'CONSULTATION_BOOKED', 'RETURN_PREPARED', 'APPROVED_BY_CLIENT', 'FILED'] }
const ST = { FILED: 'ok', PREPARED: 'ok', RETURN_PREPARED: 'ok', APPROVED_BY_CLIENT: 'ok', CLIENT_ACTION_REQUIRED: 'warn', EXPAT_STATUS_CHANGE: 'warn', SUBMITTED: 'info', READY_FOR_CONSULTATION: 'info', CONSULTATION_BOOKED: 'info' }
export const StatusChip = ({ s }) => <span className={'chip ' + (ST[s] || '')}>{LABEL[s]}</span>
export const Stepper = ({ type, status }) => { const f = FLOW[type]; const i = status === 'CLIENT_ACTION_REQUIRED' ? 0 : f.indexOf(status); const last = status === 'FILED'
  return <ol className="steps">{f.map((k, j) => <li key={k} className={last || j < i ? 'done' : j === i ? 'now' : ''}><i>{j + 1}</i>{LABEL[k]}</li>)}</ol> }
export const fmt = w => new Date(w).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
export function unitFor(civil, first, prior, abroad) {
  if (civil !== 'Married' && civil !== 'Legally cohabiting') return ['INDIVIDUAL', 'Single, divorced, widowed and de facto cohabiting people generally file separately.']
  if (abroad) return ['SPECIALIST_REVIEW', 'A partner abroad needs a residency and treaty review. Marital status alone does not allow a joint return.']
  if (first && !prior) return ['SEPARATE_WITH_PARTNER_BENEFIT_REVIEW', 'Partners are generally taxed separately in the first year; a partner-income rule may apply.']
  return ['JOINT', 'Partners are generally taxed together after the first year. Income stays recorded per person.']
}
export const caseTitle = c => ({ personal: 'Personal tax return 2027', vat: `VAT ${c.period}`, annual: `Annual accounts, ${c.period}`, autovat: `VAT ${c.period}, automatic filing` })[c.type]
