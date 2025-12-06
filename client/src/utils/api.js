// client/src/utils/api.js
import axios from 'axios';

const api = axios.create({
  // If NEXT_PUBLIC_API_URL exists, use it. Otherwise, use localhost.
  baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:5000/api',
});

export default api;