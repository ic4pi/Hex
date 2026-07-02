'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import ParticleBG from '@/components/particle-bg'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ password }) })
      if (r.ok) { toast.success('Welcome back, high priestess.'); router.push('/admin') }
      else { const j = await r.json().catch(() => ({})); toast.error(j.error || 'Invalid password') }
    } finally { setBusy(false) }
  }
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 grad-cyber"/>
      <ParticleBG density={40}/>
      <form onSubmit={submit} className="relative glass rounded-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-6">
          <Sparkles className="h-8 w-8 text-[#ff1177] animate-pulse-glow"/>
          <h1 className="font-display text-3xl mt-3"><span className="neon-pink">Hex</span><span className="neon-blue">pose</span> Admin</h1>
          <p className="text-white/60 text-sm mt-1">Enter the covenant password to continue.</p>
        </div>
        <Label className="text-white/70">Password</Label>
        <Input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-white/5 border-white/10 mt-1 mb-5"/>
        <Button type="submit" disabled={busy} className="w-full bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink h-11">{busy ? 'Opening the veil...' : 'Enter Sanctum'}</Button>
        <p className="text-[11px] text-white/40 mt-4 text-center">Default password: hexpose2025 — change via .env</p>
      </form>
    </div>
  )
}
