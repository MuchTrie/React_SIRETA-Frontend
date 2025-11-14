import apiClient from './apiClient';

// Tipe untuk user info dalam response
interface UserInfo {
  id: string;
  email: string;
  role: 'admin' | 'operasional';
}

// Tipe untuk respon login (pastikan backend Anda mengembalikan token)
interface LoginResponse {
  token: string;
  user: UserInfo;
}

// Tipe untuk respon register (sesuaikan dengan backend Anda)
interface RegisterResponse {
  message: string;
}

/**
 * Mengirim permintaan login ke backend.
 */
export const loginRequest = async (email: string, pass: string): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', { 
    email: email, 
    password: pass 
  });
  // Backend Go mengembalikan langsung { token: "...", user: {...} }
  return response.data;
};

/**
 * Mengirim permintaan registrasi ke backend.
 */
export const registerRequest = async (data: any): Promise<RegisterResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};