import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Matches your Backend Port
});

export default api;