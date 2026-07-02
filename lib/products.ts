import fs from 'fs'
import path from 'path'

export interface Product {
  id: string
  name: string
  category: 'spell' | 'apothecary' | 'apparel'
  subcategory: string
  description: string
  ingredients: string[]
  price: number
  stripeLink: string
  image: string
}

export interface StoreAssets {
  logo: string
  favicon: string
  wordmark: string
  socialShare: string
}

export interface StoreData {
  products: Product[]
  assets: StoreAssets
}

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json')

export function getStoreData(): StoreData {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  return JSON.parse(raw) as StoreData
}

export function saveStoreData(data: StoreData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}
