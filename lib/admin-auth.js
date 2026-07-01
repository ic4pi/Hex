import { cookies } from 'next/headers'

export async function isAdminAuthed(request) {
  try {
    const c = await cookies()
    const token = c.get('hexpose_admin')?.value
    return !!token && token === process.env.ADMIN_PASSWORD
  } catch {
    // fallback to header
    const h = request?.headers?.get('cookie') || ''
    const m = h.match(/hexpose_admin=([^;]+)/)
    return m && m[1] === process.env.ADMIN_PASSWORD
  }
}
