import { useState, useEffect } from 'react'

const GREEN = '#22c55e'
const RED = '#ef4444'
const BROWN = '#7E4821'

export default function InvoicePanel({ adminId, tableStyles }) {
  const { th, td } = tableStyles
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState(null)

  const loadInvoices = async function() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/finance/list-invoices?limit=100')
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'load_failed'); setInvoices([]); return }
      setInvoices(data.records || [])
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  useEffect(function() { loadInvoices() }, [])

  const handleGenerate = async function() {
    if (!window.confirm('ליצור קובץ חיוב לכל הסיורים הפעילים כרגע?')) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/finance/generate-billing-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generated_by: adminId })
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'generate_failed'); setGenerating(false); return }

      if (data.csvContent) {
        const blob = new Blob([data.csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${data.batchReference || 'billing-file'}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }

      if (data.unmatchedTours && data.unmatchedTours.length > 0) {
        window.alert('שים לב: ' + data.unmatchedTours.length + ' סיורים לא שויכו למדריך (בדוק Guide_Name).')
      }

      await loadInvoices()
    } catch (e) {
      setError(e.message)
    }
    setGenerating(false)
  }

  const handleTogglePaid = async function(invoiceId, newStatus) {
    setUpdatingId(invoiceId)
    setError(null)
    try {
      const res = await fetch('/api/finance/mark-invoice-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId, payment_status: newStatus, updated_by: adminId })
      })
      const data = await res.json()
      if (!data.ok) { setError(data.error || 'update_failed'); setUpdatingId(null); return }
      await loadInvoices()
    } catch (e) {
      setError(e.message)
    }
    setUpdatingId(null)
  }

  const statusColor = { 'Paid': GREEN, 'Not Paid': RED, 'Not Yet Marked': '#999' }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#888' }}>{invoices.length} חשבוניות</p>
        <button onClick={handleGenerate} disabled={generating}
          style={{ background: '#111', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: generating ? 'not-allowed' : 'pointer', border: 'none', fontFamily: 'Heebo, Arial, sans-serif', opacity: generating ? 0.7 : 1 }}>
          {generating ? 'מייצר...' : '📄 צור קובץ חיוב'}
        </button>
      </div>

      {error && <p style={{ color: RED, fontSize: 13, marginBottom: 16 }}>שגיאה: {error}</p>}
      {loading && <p style={{ color: '#888' }}>טוען...</p>}

      {!loading && invoices.length === 0 && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', border: '1px solid #EDE7DF' }}>
          <p style={{ color: '#B0A89E', fontSize: 15 }}>אין חשבוניות עדיין</p>
        </div>
      )}

      {!loading && invoices.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['מדריך (ID)', 'תקופה', 'סכום לפני מע"מ', 'מע"מ', 'סה"כ', 'סטטוס תשלום', 'נוצר', 'פעולות'].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {invoices.map(function(inv) {
                const total = (Number(inv.Total_Amount) || 0) + (Number(inv.VAT_Amount) || 0)
                return (
                  <tr key={inv.id}>
                    <td style={td}>{Array.isArray(inv.Guide_ID) ? inv.Guide_ID.join(', ') : inv.Guide_ID}</td>
                    <td style={td}>{inv.Billing_Period_Start} — {inv.Billing_Period_End}</td>
                    <td style={td}>{inv.Total_Amount} ₪</td>
                    <td style={td}>{inv.VAT_Amount} ₪</td>
                    <td style={Object.assign({}, td, { fontWeight: 700 })}>{total} ₪</td>
                    <td style={td}>
                      <span style={{ background: (statusColor[inv.Payment_Status] || '#999') + '22', color: statusColor[inv.Payment_Status] || '#999', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 12 }}>
                        {inv.Payment_Status || 'Not Yet Marked'}
                      </span>
                    </td>
                    <td style={td}>{inv.Generated_At ? new Date(inv.Generated_At).toLocaleDateString('he-IL') : '-'}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => handleTogglePaid(inv.id, 'Paid')} disabled={updatingId === inv.id}
                          style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid ' + GREEN, color: GREEN, cursor: 'pointer', background: '#fff' }}>
                          שולם
                        </button>
                        <button onClick={() => handleTogglePaid(inv.id, 'Not Paid')} disabled={updatingId === inv.id}
                          style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, border: '1px solid ' + RED, color: RED, cursor: 'pointer', background: '#fff' }}>
                          לא שולם
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
