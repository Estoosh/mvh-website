import { useState, useEffect } from 'react'

const BROWN = '#7E4821'
const RED = '#ef4444'

const SUB_TABS = [
  ['billing', 'תמונת מצב חיוב'],
  ['twelvemonth', '12 חודשים'],
  ['funnel', 'Funnel']
]

function StatCard({ label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EDE7DF', borderRadius: 12, padding: 20, minWidth: 140 }}>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800 }}>{value}</p>
    </div>
  )
}

function BillingSnapshotView({ th, td }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function() {
    fetch('/api/finance/reports/billing-snapshot')
      .then(r => r.json())
      .then(d => { if (!d.ok) { setError(d.error); return } setData(d) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: '#888' }}>טוען...</p>
  if (error) return <p style={{ color: RED }}>שגיאה: {error}</p>
  if (!data) return null

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatCard label="מדריכים בקובץ" value={data.guideCount} />
        <StatCard label='סה"כ לפני מע"מ' value={data.grandTotalPreVat + ' ₪'} />
        <StatCard label='סה"כ מע"מ' value={data.grandTotalVat + ' ₪'} />
        <StatCard label='סה"כ כולל' value={data.grandTotal + ' ₪'} />
      </div>

      {data.unmatchedTours && data.unmatchedTours.length > 0 && (
        <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>
          {data.unmatchedTours.length} סיורים לא שויכו למדריך (בדוק Guide_Name)
        </p>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['מדריך', 'מס\' סיורים', 'לפני מע"מ', 'מע"מ', 'סה"כ'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.guides.map(function(g) {
              return (
                <tr key={g.guide_id}>
                  <td style={td}>{g.guide_name}</td>
                  <td style={td}>{g.tour_count}</td>
                  <td style={td}>{g.pre_vat_amount} ₪</td>
                  <td style={td}>{g.vat_amount} ₪</td>
                  <td style={Object.assign({}, td, { fontWeight: 700 })}>{g.total_amount} ₪</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TwelveMonthView({ th, td }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function() {
    fetch('/api/finance/reports/twelve-month')
      .then(r => r.json())
      .then(d => { if (!d.ok) { setError(d.error); return } setData(d) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: '#888' }}>טוען...</p>
  if (error) return <p style={{ color: RED }}>שגיאה: {error}</p>
  if (!data) return null

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={th}>מדריך (ID)</th>
            {data.monthKeys.map(m => <th key={m} style={th}>{m}</th>)}
            <th style={th}>ותק בתשלום</th>
            <th style={th}>Earnings נטו</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map(function(row) {
            return (
              <tr key={row.guide_id}>
                <td style={td}>{row.guide_id}</td>
                {row.months.map(function(m) {
                  return (
                    <td key={m.month} style={td}>
                      {m.productCount > 0 ? `${m.productCount} / ${m.amountCharged}₪` : '-'}
                    </td>
                  )
                })}
                <td style={td}>{row.paying_tenure_months} חודשים</td>
                <td style={Object.assign({}, td, { fontWeight: 700 })}>{row.lifetime_net_earnings} ₪</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function FunnelView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(function() {
    fetch('/api/finance/reports/funnel')
      .then(r => r.json())
      .then(d => { if (!d.ok) { setError(d.error); return } setData(d) })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ color: '#888' }}>טוען...</p>
  if (error) return <p style={{ color: RED }}>שגיאה: {error}</p>
  if (!data) return null

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard label="לקוחות פוטנציאל" value={data.potentialCustomers} />
        <StatCard label="לקוחות משלמים" value={data.payingCustomers} />
        <StatCard label="שיעור המרה" value={data.conversionRate + '%'} />
        <StatCard label="זמן המרה ממוצע" value={data.averageConversionDays !== null ? data.averageConversionDays + ' ימים' : '-'} />
      </div>
    </div>
  )
}

export default function ReportsTab() {
  const [subTab, setSubTab] = useState('billing')

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

      {subTab === 'billing' && <BillingSnapshotView th={th} td={td} />}
      {subTab === 'twelvemonth' && <TwelveMonthView th={th} td={td} />}
      {subTab === 'funnel' && <FunnelView />}
    </div>
  )
}
