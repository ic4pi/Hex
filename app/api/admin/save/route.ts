import { NextRequest, NextResponse } from 'next/server'
import { getStoreData, saveStoreData, type StoreData } from '@/lib/products'

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<StoreData>
    const current = getStoreData()

    const updated: StoreData = {
      products: body.products ?? current.products,
      assets: body.assets ?? current.assets,
    }

    saveStoreData(updated)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Save error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
