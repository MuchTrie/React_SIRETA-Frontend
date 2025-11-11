import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginRequest } from '../services/authApi'; 
import apiClient from '../services/apiClient';
// Impor API settings
import { getSettings, FeatureSettings, updateSettings } from '../services/settingsApi'; 

// Tipe untuk payload token
interface TokenPayload {
  id: string;
  role: 'admin' | 'operasional';
  iat: number;
}

// Tipe untuk data user
interface User {
  id: string;
  email: string;
  role: 'admin' | 'operasional';
}

// Tipe context
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  settings: FeatureSettings | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, role: 'admin' | 'operasional') => Promise<void>;
  // Kita tambahkan fungsi refresh agar bisa lihat perubahan
  refreshSettings: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState<FeatureSettings | null>(null);

  // Cek token di localStorage saat aplikasi dimuat
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        setUser({
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        });
        setIsLoggedIn(true);
        // Set token di header axios
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
      }
    }
    refreshSettings();
  }, []);

  // Fungsi untuk mengambil settings (bisa dipanggil ulang)
  const refreshSettings = async () => {
    try {
      const fetchedSettings = await getSettings();
      setSettings(fetchedSettings);
    } catch (error) {
      console.error("Gagal mengambil settings:", error);
    }
  };

  // Fungsi login
  const login = async (email: string, pass: string) => {
    try {
      const response = await loginRequest(email, pass);
      const { token } = response;
      
      // Simpan token
      localStorage.setItem('token', token);
      
      // Decode token untuk ambil user info
      const decoded = jwtDecode<any>(token);
      const userInfo: User = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      
      setUser(userInfo);
      setIsLoggedIn(true);
      
      // Set token di header axios
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Refresh settings
      await refreshSettings();
    } catch (error) {
      throw error;
    }
  };

  // Fungsi register
  const register = async (email: string, password: string, role: 'admin' | 'operasional') => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registrasi gagal');
      }
      
      const data = await response.json();
      const { token } = data.data;
      
      // Simpan token
      localStorage.setItem('token', token);
      
      // Decode token
      const decoded = jwtDecode<any>(token);
      const userInfo: User = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      
      setUser(userInfo);
      setIsLoggedIn(true);
      
      // Set token di header axios
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Refresh settings
      await refreshSettings();
    } catch (error) {
      throw error;
    }
  };

  // Fungsi logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsLoggedIn(false);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, settings, login, logout, register, refreshSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook kustom
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}