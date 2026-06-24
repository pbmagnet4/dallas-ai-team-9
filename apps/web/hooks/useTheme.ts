'use client';

import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  // Sync initial state from what the inline script already applied
  useEffect(() => {
    const applied = document.documentElement.getAttribute('data-theme');
    if (applied === 'dark') setTheme('dark');
  }, []);

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      try {
        localStorage.setItem('navflow-theme', next);
      } catch {
        // localStorage unavailable (private browsing, etc.) — ignore
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
