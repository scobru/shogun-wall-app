import { useState, useEffect } from 'react'

export type ThemeMode = 'light' | 'dark'
export type DaisyTheme = 'hal-light' | 'hal-dark'

interface ThemeState {
  mode: ThemeMode
  daisyTheme: DaisyTheme
  toggleTheme: () => void
  setTheme: (theme: ThemeMode) => void
}

export const useDaisyTheme = (): ThemeState => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    // Get initial theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme')
    return (savedTheme as ThemeMode) || 'light'
  })

  const daisyTheme: DaisyTheme = mode === 'dark' ? 'hal-dark' : 'hal-light'

  const applyTheme = (newMode: ThemeMode) => {
    const newDaisyTheme = newMode === 'dark' ? 'hal-dark' : 'hal-light'
    const html = document.documentElement
    
    // Set both attributes for compatibility
    html.setAttribute('data-theme', newDaisyTheme)
    html.setAttribute('data-color-scheme', newMode)
    
    // Save to localStorage
    localStorage.setItem('theme', newMode)
    
    console.log(`🎨 Tema cambiato: ${newDaisyTheme} (${newMode})`)
  }

  const setTheme = (newMode: ThemeMode) => {
    setMode(newMode)
    applyTheme(newMode)
  }

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light'
    setTheme(newMode)
  }

  // Apply theme on mount and mode change
  useEffect(() => {
    applyTheme(mode)
  }, [mode])

  // Listen for system theme changes (optional)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if no user preference is saved
      if (!localStorage.getItem('theme')) {
        const systemTheme = e.matches ? 'dark' : 'light'
        setMode(systemTheme)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  return {
    mode,
    daisyTheme,
    toggleTheme,
    setTheme,
  }
} 