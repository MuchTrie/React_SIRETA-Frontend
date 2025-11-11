import axios from 'axios';

const apiClient = axios.create({
  // Base URL untuk API backend
  baseURL: 'http://localhost:8080/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;