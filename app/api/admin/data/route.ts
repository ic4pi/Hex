import { NextResponse } from 'next/server'
import { getStoreData } from '@/lib/products'

export async function GET() {
  try {
    const data = getStoreData()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
