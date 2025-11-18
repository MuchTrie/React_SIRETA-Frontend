import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginRequest, registerRequest } from '../services/authApi'; 
import apiClient from '../services/apiClient';
// Impor API settings
import { getSettings, FeatureSettings } from '../services/settingsApi'; 


// Tipe untuk data user
interface User {
  id: string;
  email: string;
  username?: string;
  role: 'admin' | 'operasional';
}

// Tipe context
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  settings: FeatureSettings | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, role: 'admin' | 'operasional') => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  // Kita tambahkan fungsi refresh agar bisa lihat perubahan
  refreshSettings: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [settings, setSettings] = useState<FeatureSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk mengambil settings (bisa dipanggil ulang)
  const refreshSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return; // Tidak ada token, skip fetch settings
      }
      const fetchedSettings = await getSettings();
      setSettings(fetchedSettings);
    } catch (error) {
      console.error("Gagal mengambil settings:", error);
      // Jangan logout jika gagal fetch settings
    }
  };

  // Cek token di localStorage saat aplikasi dimuat
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode<any>(token);
          
          // Validasi token belum expired
          const currentTime = Date.now() / 1000;
          if (decoded.exp && decoded.exp < currentTime) {
            // Token expired
            localStorage.removeItem('token');
            return;
          }
          
          setUser({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
          });
          setIsLoggedIn(true);
          // Set token di header axios
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch settings setelah token di-set
          await refreshSettings();
        } catch (error) {
          console.error('Invalid token:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  // Return loading state saat masih checking auth
  if (loading) {
    return <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      background: '#0f0f17'
    }}>
      <div style={{ color: '#fff' }}>Loading...</div>
    </div>;
  }

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
      const authData = await registerRequest(email, password, role);
      
      if (!authData || !authData.token) {
        throw new Error('Invalid response from server');
      }
      
      const { token, user } = authData;
      
      // Simpan token
      localStorage.setItem('token', token);
      
      // Set user info
      const userInfo: User = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      
      setUser(userInfo);
      setIsLoggedIn(true);
      
      // Set token di header axios
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Refresh settings
      await refreshSettings();
    } catch (error) {
      console.error('Register error:', error);
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

  // Fungsi update user
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, settings, loading, login, logout, register, updateUser, refreshSettings }}>
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