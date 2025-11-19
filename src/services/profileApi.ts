import apiClient from './apiClient';

interface UserInfo {
  id: string;
  email: string;
  role: 'admin' | 'operasional';
  username?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  token?: string;
}

interface UpdateProfileRequest {
  username: string;
  email: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update user profile (username and email)
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<UserInfo>> => {
  const response = await apiClient.put<ApiResponse<UserInfo>>('/profile', data);
  return response.data;
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
  const response = await apiClient.put<ApiResponse<null>>('/change-password', data);
  return response.data;
};
