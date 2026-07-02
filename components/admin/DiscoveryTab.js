import { useState } from 'react'
import DiscoveryQueuePanel from './DiscoveryQueuePanel'

const BROWN = '#7E4821'

// Only "Discovery Queue" is built in Phase 1. Outreach Campaigns, Founder
// Funnel, and Communication History are later phases — this array is
// structured so adding them later is a one-line change, same pattern as
// FinanceTab.js's SUB_TABS.
const SUB_TABS = [
  ['queue', 'Discovery Queue']
]

export default function DiscoveryTab({ adminId }) {
  const [subTab, setSubTab] = useState('queue')

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

      {subTab === 'queue' && <DiscoveryQueuePanel adminId={adminId} tableStyles={{ th, td }} />}
    </div>
  )
}
