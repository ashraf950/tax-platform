export const STAGES = ['Intake submitted', 'Under review', 'Ready for consultation', 'Consultation booked', 'Return prepared', 'Approvals', 'Filed and confirmed']
export const eur = n => new Intl.NumberFormat('en-BE', { style: 'currency', currency: 'EUR' }).format(n)
export const sales = [
  { no: 'INV-2026-014', buyer: 'Bakkerij Peeters', date: '02 Sep 2026', net: 1000, vat: 210, status: 'DELIVERED' },
  { no: 'INV-2026-015', buyer: 'Studio Janssens', date: '20 Sep 2026', net: 450, vat: 94.5, status: 'TRANSPORT_ACCEPTED' },
  { no: 'INV-2026-016', buyer: 'Private customer', date: '28 Sep 2026', net: 120, vat: 25.2, status: 'FAILED', note: 'Buyer is not on Peppol' },
]
export const purchases0 = [
  { id: 1, seller: 'Example Supplier', no: 'SUP-2026-00981', date: '15 Sep 2026', net: 300, vat: 63, recovery: null, status: 'NEEDS_REVIEW' },
  { id: 2, seller: 'Office Supplies BV', no: 'OS-4471', date: '18 Sep 2026', net: 80, vat: 16.8, recovery: 1, status: 'APPROVED' },
]
export const queue = [
  { client: 'A. Verma', year: 2027, unit: 'SPECIALIST_REVIEW', ready: 60, blockers: 3, expat: true, status: 'UNDER_REVIEW' },
  { client: 'M. Claes and L. Claes', year: 2027, unit: 'JOINT', ready: 90, blockers: 1, expat: false, status: 'READY_FOR_CONSULTATION' },
  { client: 'S. Rahman', year: 2027, unit: 'INDIVIDUAL', ready: 100, blockers: 0, expat: false, status: 'RETURN_PREPARED' },
]
