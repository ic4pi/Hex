'use client'
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X, Plus, Search } from 'lucide-react'

/**
 * Chip-style multi-select with a preset library and free-form "add custom" input.
 * Values are stored as string[]. Backward-compatible: if given a string, it will
 * be normalized to an array on first change.
 *
 * Props:
 *   value: string[] | string | undefined
 *   onChange: (arr: string[]) => void
 *   library: string[] - preset options to pick from
 *   placeholder?: string
 */
export function TagPicker({ value, onChange, library = [], placeholder = 'Type to add...' }) {
  const normalized = Array.isArray(value)
    ? value
    : typeof value === 'string' && value.trim()
      ? value.split(',').map(s => s.trim()).filter(Boolean)
      : []

  const [query, setQuery] = useState('')
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    const remaining = library.filter(l => !normalized.includes(l))
    if (!q) return remaining.slice(0, 12)
    return remaining.filter(l => l.toLowerCase().includes(q)).slice(0, 12)
  }, [library, query, normalized])

  const add = (tag) => {
    const t = tag.trim()
    if (!t) return
    if (normalized.includes(t)) return
    onChange([...normalized, t])
    setQuery('')
  }

  const remove = (tag) => onChange(normalized.filter(t => t !== tag))

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      add(query)
    } else if (e.key === 'Backspace' && !query && normalized.length) {
      remove(normalized[normalized.length - 1])
    }
  }

  return (
    <div className="glass rounded-md p-2 border border-white/10">
      <div className="flex flex-wrap gap-1.5 items-center min-h-[36px]">
        {normalized.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[#ff1177]/15 border border-[#ff1177]/40 text-white">
            {tag}
            <button type="button" onClick={() => remove(tag)} className="hover:text-red-300">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none pl-7 pr-2 py-1 text-sm text-white placeholder:text-white/40"
          />
        </div>
        {query.trim() && !normalized.includes(query.trim()) && (
          <Button type="button" size="sm" variant="outline" onClick={() => add(query)} className="h-7 border-white/15 text-xs">
            <Plus className="h-3 w-3 mr-1" /> Add "{query.trim()}"
          </Button>
        )}
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-[11px] px-2 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
