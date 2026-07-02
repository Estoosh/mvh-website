import { useState } from 'react'
import InvoicePanel from './InvoicePanel'
import SuspensionPanel from './SuspensionPanel'
import CreditPanel from './CreditPanel'
import BenefitPanel from './BenefitPanel'
import AuditLogViewer from './AuditLogViewer'
import ReportsTab from './ReportsTab'

const BROWN = '#7E4821'

const SUB_TABS = [
  ['invoices', 'חשבוניות'],
  ['suspensions', 'השהיות'],
  ['credits', 'זיכויים'],
  ['benefits', 'הטבות'],
  ['reports', 'דוחות'],
  ['audit', 'יומן פעולות']
]

export default function FinanceTab({ adminId }) {
  const [subTab, setSubTab] = useState('invoices')

  const th = { padding: '10px 12px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#888', borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }
  const td = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #f0f0f0', verticalAlign: 'middle' }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SUB_TABS.map(function(item) {
          const active = subTab === item[0]
          return (
            <button key={item[0]} onClick={() => setSubTab(item[0])}
              style={{ padding: '8px 20px', borderRadius: 20, border: '1.5px solid', fontSize: 14, cursor: 'pointer', fontFamily: 'Heebo, Arial, sans-serif', fontWeight: 700,
                background: active ? BROWN : '#fff', color: active ? '#fff' : '#444',
                borderColor: active ? BROWN : '#ddd' }}>
              {item[1]}
            </button>
          )
        })}
      </div>

      {subTab === 'invoices' && <InvoicePanel adminId={adminId} tableStyles={{ th, td }} />}
      {subTab === 'suspensions' && <SuspensionPanel adminId={adminId} tableStyles={{ th, td }} />}
      {subTab === 'credits' && <CreditPanel adminId={adminId} tableStyles={{ th, td }} />}
      {subTab === 'benefits' && <BenefitPanel adminId={adminId} tableStyles={{ th, td }} />}
      {subTab === 'reports' && <ReportsTab />}
      {subTab === 'audit' && <AuditLogViewer tableStyles={{ th, td }} />}
    </div>
  )
}
