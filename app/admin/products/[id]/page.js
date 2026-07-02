'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ArrowLeft, Save, Trash2, Eye, Plus, GripVertical, X } from 'lucide-react'
import { TagPicker } from '@/components/tag-picker'
import {
  MOON_PHASES, PLANETS, ZODIAC, ELEMENTS, CHAKRAS, CANDLE_COLORS,
  DIFFICULTY, ENERGY_LEVELS, CRYSTAL_LIBRARY, HERB_LIBRARY,
} from '@/lib/spell-options'

const BLANK = {
  name: '', slug: '', category: 'spell-jars', description: '', rich_description: '',
  price: 0, compare_at_price: 0, sku: '', inventory: 0,
  hero_image: '', gallery_images: [],
  featured: false, bestseller: false, new_arrival: false, limited_edition: false, active: true,
  seo_title: '', seo_description: '',
  spell: { magical_intention: '', moon_phase: '', planet: '', zodiac: '', element: '', chakra: '', crystal: [], herbs: [], candle_color: '', ritual_duration: '', difficulty: '', energy_level: '', care_instructions: '', ingredients: '', safety_disclaimer: '' },
}

export default function ProductEditor() {
  const { id } = useParams()
  const router = useRouter()
  const isNew = id === 'new'
  const [p, setP] = useState(BLANK)
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(setCats)
    if (!isNew) {
      fetch(`/api/products/${id}`).then(r => r.json()).then(d => {
        setP({ ...BLANK, ...d, spell: { ...BLANK.spell, ...(d.spell || {}) } })
        setLoading(false)
      })
    }
  }, [id, isNew])

  const set = (k, v) => setP(prev => ({ ...prev, [k]: v }))
  const setSpell = (k, v) => setP(prev => ({ ...prev, spell: { ...prev.spell, [k]: v } }))

  const save = async (asDraft = false) => {
    setBusy(true)
    try {
      const payload = { ...p, active: asDraft ? false : p.active }
      const opts = { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) }
      const url = isNew ? '/api/products' : `/api/products/${id}`
      const r = await fetch(url, opts)
      if (!r.ok) { const j = await r.json().catch(() => ({})); throw new Error(j.error || 'Failed') }
      const saved = await r.json()
      toast.success(asDraft ? 'Saved as draft' : (isNew ? 'Product created' : 'Product updated'))
      if (isNew) router.push(`/admin/products/${saved.id}`)
    } catch (e) { toast.error(String(e.message || e)) } finally { setBusy(false) }
  }

  const del = async () => {
    if (!confirm('Delete this product?')) return
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (r.ok) { toast.success('Deleted'); router.push('/admin/products') }
  }

  const addGallery = () => {
    const url = prompt('Paste image URL:')
    if (url) set('gallery_images', [...(p.gallery_images || []), url])
  }
  const removeGallery = (i) => set('gallery_images', p.gallery_images.filter((_, idx) => idx !== i))
  const moveGallery = (from, to) => {
    const arr = [...p.gallery_images]
    const [item] = arr.splice(from, 1); arr.splice(to, 0, item)
    set('gallery_images', arr)
  }

  if (loading) return <div className="text-white/60">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon"><Link href="/admin/products"><ArrowLeft className="h-4 w-4"/></Link></Button>
          <div>
            <p className="neon-pink uppercase tracking-widest text-xs">Editor</p>
            <h1 className="font-display text-2xl md:text-3xl">{isNew ? 'New Product' : p.name || 'Untitled'}</h1>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isNew && p.slug && <Button asChild variant="outline" className="border-white/15"><Link href={`/product/${p.slug}`} target="_blank"><Eye className="h-4 w-4 mr-2"/>Preview</Link></Button>}
          <Button variant="outline" className="border-white/15" onClick={() => save(true)} disabled={busy}>Save Draft</Button>
          <Button className="bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink" onClick={() => save(false)} disabled={busy}><Save className="h-4 w-4 mr-2"/>{isNew ? 'Create' : 'Publish'}</Button>
          {!isNew && <Button variant="ghost" onClick={del} className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="h-4 w-4"/></Button>}
        </div>
      </div>

      <Tabs defaultValue="basics" className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="spell">Spell Metadata</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="flags">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Name *"><Input value={p.name} onChange={e => set('name', e.target.value)} className="bg-white/5 border-white/10"/></Field>
            <Field label="Slug (URL)"><Input value={p.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-from-name" className="bg-white/5 border-white/10"/></Field>
            <Field label="Category">
              <Select value={p.category} onValueChange={(v) => set('category', v)}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue/></SelectTrigger>
                <SelectContent className="bg-black border-white/10">
                  {cats.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="SKU"><Input value={p.sku} onChange={e => set('sku', e.target.value)} className="bg-white/5 border-white/10"/></Field>
            <Field label="Price ($)"><Input type="number" step="0.01" value={p.price} onChange={e => set('price', parseFloat(e.target.value) || 0)} className="bg-white/5 border-white/10"/></Field>
            <Field label="Compare At Price ($)"><Input type="number" step="0.01" value={p.compare_at_price} onChange={e => set('compare_at_price', parseFloat(e.target.value) || 0)} className="bg-white/5 border-white/10"/></Field>
            <Field label="Inventory"><Input type="number" value={p.inventory} onChange={e => set('inventory', parseInt(e.target.value) || 0)} className="bg-white/5 border-white/10"/></Field>
          </div>
          <Field label="Short Description"><Textarea rows={3} value={p.description} onChange={e => set('description', e.target.value)} className="bg-white/5 border-white/10"/></Field>
          <Field label="Rich Description"><Textarea rows={6} value={p.rich_description} onChange={e => set('rich_description', e.target.value)} className="bg-white/5 border-white/10"/></Field>
        </TabsContent>

        <TabsContent value="images" className="mt-6 space-y-4">
          <Field label="Hero Image URL">
            <Input value={p.hero_image} onChange={e => set('hero_image', e.target.value)} placeholder="https://..." className="bg-white/5 border-white/10"/>
            {p.hero_image && <img src={p.hero_image} className="mt-3 w-48 h-48 object-cover rounded-md border border-white/10"/>}
          </Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-white/70">Gallery Images (drag to reorder)</Label>
              <Button size="sm" variant="outline" className="border-white/15" onClick={addGallery}><Plus className="h-3 w-3 mr-1"/> Add Image</Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(p.gallery_images || []).map((g, i) => (
                <div key={i} draggable onDragStart={e => e.dataTransfer.setData('idx', i)} onDragOver={e => e.preventDefault()} onDrop={e => moveGallery(parseInt(e.dataTransfer.getData('idx')), i)} className="relative group rounded-md overflow-hidden border border-white/10">
                  <img src={g} className="aspect-square w-full object-cover"/>
                  <button onClick={() => removeGallery(i)} className="absolute top-1 right-1 bg-black/80 rounded p-1 opacity-0 group-hover:opacity-100"><X className="h-3 w-3"/></button>
                  <div className="absolute top-1 left-1 bg-black/80 rounded p-1 opacity-0 group-hover:opacity-100 cursor-move"><GripVertical className="h-3 w-3"/></div>
                </div>
              ))}
              {(!p.gallery_images || p.gallery_images.length === 0) && <p className="text-white/40 text-sm col-span-full">No gallery images yet.</p>}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="spell" className="mt-6 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Magical Intention">
              <Input value={p.spell?.magical_intention || ''} onChange={e => setSpell('magical_intention', e.target.value)} placeholder="e.g., Protection & Warding" className="bg-white/5 border-white/10"/>
            </Field>
            <Field label="Ritual Duration">
              <Input value={p.spell?.ritual_duration || ''} onChange={e => setSpell('ritual_duration', e.target.value)} placeholder='e.g., "7 days" or "One lunar cycle"' className="bg-white/5 border-white/10"/>
            </Field>
            <PickerField label="Moon Phase" options={MOON_PHASES} value={p.spell?.moon_phase} on={v => setSpell('moon_phase', v)}/>
            <PickerField label="Planet" options={PLANETS} value={p.spell?.planet} on={v => setSpell('planet', v)}/>
            <PickerField label="Zodiac" options={ZODIAC} value={p.spell?.zodiac} on={v => setSpell('zodiac', v)}/>
            <PickerField label="Element" options={ELEMENTS} value={p.spell?.element} on={v => setSpell('element', v)}/>
            <PickerField label="Chakra" options={CHAKRAS} value={p.spell?.chakra} on={v => setSpell('chakra', v)}/>
            <PickerField label="Candle Color" options={CANDLE_COLORS} value={p.spell?.candle_color} on={v => setSpell('candle_color', v)}/>
            <PickerField label="Difficulty" options={DIFFICULTY} value={p.spell?.difficulty} on={v => setSpell('difficulty', v)}/>
            <PickerField label="Energy Level" options={ENERGY_LEVELS} value={p.spell?.energy_level} on={v => setSpell('energy_level', v)}/>
          </div>
          <Field label="Crystals (multi-select)">
            <TagPicker value={p.spell?.crystal} library={CRYSTAL_LIBRARY} placeholder="Search or type to add..." onChange={arr => setSpell('crystal', arr)}/>
          </Field>
          <Field label="Herbs (multi-select)">
            <TagPicker value={p.spell?.herbs} library={HERB_LIBRARY} placeholder="Search or type to add..." onChange={arr => setSpell('herbs', arr)}/>
          </Field>
          <div className="space-y-4">
            <Field label="Care Instructions"><Textarea rows={2} value={p.spell?.care_instructions || ''} onChange={e => setSpell('care_instructions', e.target.value)} className="bg-white/5 border-white/10"/></Field>
            <Field label="Ingredients"><Textarea rows={2} value={p.spell?.ingredients || ''} onChange={e => setSpell('ingredients', e.target.value)} className="bg-white/5 border-white/10"/></Field>
            <Field label="Safety Disclaimer"><Textarea rows={2} value={p.spell?.safety_disclaimer || ''} onChange={e => setSpell('safety_disclaimer', e.target.value)} className="bg-white/5 border-white/10"/></Field>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-6 space-y-4">
          <Field label="SEO Title"><Input value={p.seo_title} onChange={e => set('seo_title', e.target.value)} className="bg-white/5 border-white/10"/></Field>
          <Field label="SEO Description"><Textarea rows={3} value={p.seo_description} onChange={e => set('seo_description', e.target.value)} className="bg-white/5 border-white/10"/></Field>
        </TabsContent>

        <TabsContent value="flags" className="mt-6 space-y-3">
          <Toggle label="Active (Published)" val={p.active} on={v => set('active', v)}/>
          <Toggle label="Featured" val={p.featured} on={v => set('featured', v)}/>
          <Toggle label="Bestseller" val={p.bestseller} on={v => set('bestseller', v)}/>
          <Toggle label="New Arrival" val={p.new_arrival} on={v => set('new_arrival', v)}/>
          <Toggle label="Limited Edition" val={p.limited_edition} on={v => set('limited_edition', v)}/>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({ label, children }) {
  return <div><Label className="text-white/70 mb-1 block">{label}</Label>{children}</div>
}
function PickerField({ label, options, value, on }) {
  return (
    <Field label={label}>
      <Select value={value || ''} onValueChange={(v) => on(v === '__clear__' ? '' : v)}>
        <SelectTrigger className="bg-white/5 border-white/10">
          <SelectValue placeholder="— Select —" />
        </SelectTrigger>
        <SelectContent className="bg-black border-white/10 text-white max-h-72">
          {value && <SelectItem value="__clear__" className="text-white/60">— Clear —</SelectItem>}
          {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </Field>
  )
}
function Toggle({ label, val, on }) {
  return (
    <div className="glass rounded-lg px-4 py-3 flex items-center justify-between">
      <span className="text-sm text-white/85">{label}</span>
      <Switch checked={!!val} onCheckedChange={on}/>
    </div>
  )
}
