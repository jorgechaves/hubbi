'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  if (!mounted) return <div className="h-7 w-14 rounded-full bg-current/10 animate-pulse" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="relative h-7 w-14 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      style={{
        background: isDark
          ? 'rgba(0,212,170,0.15)'
          : 'rgba(0,71,212,0.1)',
        border: `1px solid ${isDark ? 'rgba(0,212,170,0.3)' : 'rgba(0,71,212,0.2)'}`,
      }}
    >
      {/* Track icons */}
      <Sun
        className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-opacity duration-200"
        style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#0047d4', opacity: isDark ? 0.3 : 1 }}
      />
      <Moon
        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 transition-opacity duration-200"
        style={{ color: isDark ? '#00d4aa' : 'rgba(0,0,0,0.2)', opacity: isDark ? 1 : 0.3 }}
      />

      {/* Thumb */}
      <span
        className="absolute top-0.5 h-[22px] w-[22px] rounded-full shadow-sm transition-all duration-300 flex items-center justify-center"
        style={{
          left: isDark ? 'calc(100% - 24px)' : '2px',
          background: isDark ? '#00d4aa' : '#0047d4',
        }}
      />
    </button>
  )
}
