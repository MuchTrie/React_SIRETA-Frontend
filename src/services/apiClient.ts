import axios from 'axios';

const apiClient = axios.create({
  // GANTI INI DENGAN BASE URL API BACKEND ANDA
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;