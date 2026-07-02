'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

export default function CategoriesPage() {
  const [cats, setCats] = useState([])
  const [form, setForm] = useState({ name: '', slug: '', description: '' })
  const load = () => fetch('/api/categories').then(r => r.json()).then(setCats)
  useEffect(() => { load() }, [])
  const add = async () => {
    if (!form.name) return
    const r = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(form) })
    if (r.ok) { toast.success('Category added'); setForm({ name:'', slug:'', description:'' }); load() }
  }
  const del = async (id) => {
    if (!confirm('Delete category?')) return
    const r = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    if (r.ok) { toast.success('Deleted'); load() }
  }
  return (
    <div>
      <p className="neon-pink uppercase tracking-widest text-xs">Catalog</p>
      <h1 className="font-display text-4xl mt-2 mb-8">Categories</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass rounded-xl p-5 space-y-3">
          <h3 className="font-display text-lg">Add New</h3>
          <div><Label className="text-white/70">Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 mt-1"/></div>
          <div><Label className="text-white/70">Slug</Label><Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="bg-white/5 border-white/10 mt-1" placeholder="auto"/></div>
          <div><Label className="text-white/70">Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10 mt-1"/></div>
          <Button onClick={add} className="w-full bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink"><Plus className="h-4 w-4 mr-2"/>Add Category</Button>
        </div>
        <div className="md:col-span-2 space-y-2">
          {cats.map(c => (
            <div key={c.id} className="glass rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-white/50">/{c.slug}</p>
                {c.description && <p className="text-xs text-white/60 mt-1">{c.description}</p>}
              </div>
              <Button size="icon" variant="ghost" onClick={() => del(c.id)} className="hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
