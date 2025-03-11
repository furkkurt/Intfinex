import type { NextApiRequest, NextApiResponse } from 'next'

const API_KEY = process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY
const BASE_URL = 'https://v6.exchangerate-api.com/v6'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fromCurrency, toCurrency } = req.query

  try {
    const response = await fetch(
      `${BASE_URL}/${API_KEY}/pair/${fromCurrency}/${toCurrency}`
    )
    const data = await response.json()
    res.status(200).json(data)
  } catch {
    res.status(500).json({ message: 'Internal Server Error' })
  }
} 