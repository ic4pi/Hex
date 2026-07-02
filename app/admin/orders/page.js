'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, ShoppingCart, DollarSign, PackageCheck } from 'lucide-react'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = q
    ? orders.filter(o =>
        o.customer_email?.toLowerCase().includes(q.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(q.toLowerCase()) ||
        o.stripe_session?.includes(q)
      )
    : orders

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0)

  return (
    <div>
      <div className="mb-8">
        <p className="neon-pink uppercase tracking-widest text-xs">Commerce</p>
        <h1 className="font-display text-4xl mt-2">Orders</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-[#ff1177]/10"><ShoppingCart className="h-5 w-5 text-[#ff1177]"/></div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-widest">Total Orders</p>
            <p className="font-display text-2xl">{orders.length}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-[#3ea6ff]/10"><DollarSign className="h-5 w-5 text-[#3ea6ff]"/></div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-widest">Total Revenue</p>
            <p className="font-display text-2xl">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="glass rounded-xl p-5 flex items-center gap-4">
          <div className="p-2 rounded-lg bg-green-500/10"><PackageCheck className="h-5 w-5 text-green-400"/></div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-widest">Paid</p>
            <p className="font-display text-2xl">{orders.filter(o => o.status === 'paid').length}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by email, name, or session ID..."
          className="pl-9 bg-white/5 border-white/10 max-w-md"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 text-xs uppercase tracking-widest text-white/50 px-5 py-3 border-b border-white/10">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-4">Items</div>
          <div className="col-span-1 text-right">Total</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-white/50">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="h-8 w-8 mx-auto text-white/20 mb-3"/>
            <p className="text-white/50">
              {orders.length === 0 ? 'No orders yet. Orders appear here after Stripe checkout completes.' : 'No orders match your search.'}
            </p>
          </div>
        ) : filtered.map(order => (
          <div key={order.id} className="grid grid-cols-1 md:grid-cols-12 items-start gap-3 px-5 py-4 border-b border-white/5 text-sm">
            <div className="col-span-3">
              <p className="font-medium">{order.customer_name || '—'}</p>
              <p className="text-white/50 text-xs truncate">{order.customer_email || '—'}</p>
            </div>
            <div className="col-span-2 text-white/60 text-xs">{fmt(order.created_at)}</div>
            <div className="col-span-4">
              {Array.isArray(order.items) && order.items.length > 0 ? (
                <ul className="space-y-0.5">
                  {order.items.map((item, i) => (
                    <li key={i} className="text-white/70 text-xs">
                      {item.qty}× {item.name}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-white/30 text-xs">—</span>
              )}
            </div>
            <div className="col-span-1 text-right font-medium">${(order.total || 0).toFixed(2)}</div>
            <div className="col-span-2 text-right">
              <Badge className={
                order.status === 'paid'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'bg-white/10 text-white/60'
              }>
                {order.status || 'unknown'}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
