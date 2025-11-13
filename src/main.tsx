import ReactDOM from 'react-dom/client';
// ConfigProvider akan kita pindah ke App.tsx
// import { ConfigProvider } from 'antd'; 
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext'; // <-- 1. IMPORT
import App from './App';
import 'antd/dist/reset.css';
import './App.css'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    {/* 2. BUNGKUS DI LUAR SEMUANYA */}
    <ThemeProvider> 
      <AuthProvider>
        {/* Hapus ConfigProvider dari sini */}
        <App />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>,
);