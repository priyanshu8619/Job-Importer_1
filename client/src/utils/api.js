import axios from 'axios';

// Get the base URL from env or use localhost, and force it to end with /api
const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Remove trailing slash if it exists (e.g., .com/)
  if (url.endsWith('/')) url = url.slice(0, -1);
  
  // Check if user already added /api to the variable. If not, add it.
  if (!url.endsWith('/api')) url += '/api';
  
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
});

export default api;