'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [b, setB] = useState(null)
  useEffect(() => { fetch('/api/branding').then(r => r.json()).then(setB) }, [])
  return (
    <div>
      <p className="neon-pink uppercase tracking-widest text-xs">System</p>
      <h1 className="font-display text-4xl mt-2 mb-6">Settings</h1>
      <div className="glass rounded-xl p-6 space-y-4 max-w-2xl">
        <div>
          <Label className="text-white/70">Admin Password</Label>
          <p className="text-white/50 text-xs mt-1">Configure via the ADMIN_PASSWORD variable in your <code className="text-white/70">.env</code> file. After changing, restart the server.</p>
        </div>
        <div>
          <Label className="text-white/70">Environment</Label>
          <p className="text-white/50 text-xs mt-1">Database: <code className="text-white/70">MONGO_URL</code> (from .env). Base URL: <code className="text-white/70">NEXT_PUBLIC_BASE_URL</code>.</p>
        </div>
        <div>
          <Label className="text-white/70">Future Modules</Label>
          <ul className="text-white/60 text-sm mt-2 space-y-1 list-disc list-inside">
            <li>Merchize integration</li><li>Stripe checkout</li><li>Marketing automations</li><li>Tarot bookings</li><li>Games</li><li>Marketplace</li><li>Customer accounts</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
