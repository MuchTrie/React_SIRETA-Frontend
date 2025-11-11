import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipe untuk nilai yang akan disediakan context
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 1. Cek localStorage atau preferensi sistem untuk tema awal
  const getInitialTheme = (): 'light' | 'dark' => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (storedTheme) {
      return storedTheme;
    }
    // Cek preferensi media (dark mode) browser
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Simpan pilihan ke localStorage
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // 2. Efek untuk mengubah atribut di tag <html> (opsional tapi bagus)
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. Hook kustom untuk memudahkan penggunaan
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}