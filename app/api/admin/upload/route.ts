import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const key = formData.get('key') as string | null

    if (!file || !key) {
      return NextResponse.json(
        { ok: false, error: 'Missing file or key' },
        { status: 400 }
      )
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif']
    if (!allowed.includes(ext)) {
      return NextResponse.json(
        { ok: false, error: 'File type not allowed' },
        { status: 400 }
      )
    }

    const sanitizedKey = key.replace(/[^a-z0-9-_]/gi, '-').slice(0, 80)
    const filename = `${sanitizedKey}.${ext}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    await mkdir(uploadsDir, { recursive: true })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(path.join(uploadsDir, filename), buffer)

    const url = `/uploads/${filename}`
    return NextResponse.json({ ok: true, url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
