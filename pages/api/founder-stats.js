const GUIDES_TABLE = 'Guides'
const TOURS_TABLE = 'Tours'

async function fetchAllRecords({ baseId, tableId, headers, filterByFormula }) {
  let records = []
  let offset = null

  do {
    const params = new URLSearchParams()
    params.set('pageSize', '100')

    if (offset) params.set('offset', offset)
    if (filterByFormula) params.set('filterByFormula', filterByFormula)

    const res = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}?${params.toString()}`,
      { headers }
    )

    if (!res.ok) {
      throw new Error('airtable_fetch_failed')
    }

    const data = await res.json()
    records = records.concat(data.records || [])
    offset = data.offset
  } while (offset)

  return records
}

function getTourPrice(fields) {
  const possibleFields = [
    'Price',
    'price',
    'Price_Per_Person',
    'price_per_person',
    'Tour_Price',
    'tour_price'
  ]

  for (const field of possibleFields) {
    const value = fields[field]
    const number = Number(value)
    if (!Number.isNaN(number) && number > 0) return number
  }

  return 0
}

export default async function handler(req, res) {
  try {
    const token =
      process.env.AIRTABLE_TOKEN ||
      process.env.AIRTABLE_API_KEY ||
      process.env.AIRTABLE_ACCESS_TOKEN

    const baseId =
      process.env.AIRTABLE_BASE_ID ||
      process.env.AIRTABLE_BASE

    if (!token || !baseId) {
      return res.status(500).json({ error: 'missing_airtable_config' })
    }

    const headers = {
      Authorization: `Bearer ${token}`
    }

    const guides = await fetchAllRecords({
      baseId,
      tableId: GUIDES_TABLE,
      headers,
      filterByFormula: 'NOT({Founder_Number} = BLANK())'
    })

    const tours = await fetchAllRecords({
      baseId,
      tableId: TOURS_TABLE,
      headers
    })

  const founderTours = tours.filter(function(record) {
  const fields = record.fields || {}
  return fields.Tour_Title && fields.Tour_Title !== 'Tour_Title'
})
    const prices = founderTours
      .map(function(record) {
        return getTourPrice(record.fields || {})
      })
      .filter(function(price) {
        return price > 0
      })

    const averagePrice =
      prices.length > 0
        ? Math.round(prices.reduce(function(sum, price) { return sum + price }, 0) / prices.length)
        : 0

    const founderCount = guides.length
    const tourCount = founderTours.length
    const remainingFounderSpots = Math.max(0, 100 - founderCount)

    return res.status(200).json({
      founderCount,
      tourCount,
      averagePrice,
      remainingFounderSpots
    })
  } catch (err) {
    return res.status(500).json({ error: 'founder_stats_failed' })
  }
}
