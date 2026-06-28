import AdminDashboard from '@/components/AdminDashboard'
import { getStoreData } from '@/lib/products'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const data = getStoreData()
  return <AdminDashboard initialData={data} />
}
