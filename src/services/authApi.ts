import apiClient from './apiClient';

// Tipe untuk user info dalam response
interface UserInfo {
  id: string;
  email: string;
  role: 'admin' | 'operasional';
}

// Tipe untuk data auth (token + user)
interface AuthData {
  token: string;
  user: UserInfo;
}

// Tipe untuk respon API dengan wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Mengirim permintaan login ke backend.
 */
export const loginRequest = async (email: string, pass: string): Promise<AuthData> => {
  const response = await apiClient.post<ApiResponse<AuthData>>('/auth/login', { 
    email: email, 
    password: pass 
  });
  // Backend sekarang mengembalikan { success, message, data: { token, user } }
  return response.data.data;
};

/**
 * Mengirim permintaan registrasi ke backend.
 */
export const registerRequest = async (email: string, password: string, role: string): Promise<AuthData> => {
  const response = await apiClient.post<ApiResponse<AuthData>>('/auth/register', { 
    email, 
    password, 
    role 
  });
  console.log('Register response:', response.data);
  return response.data.data;
};