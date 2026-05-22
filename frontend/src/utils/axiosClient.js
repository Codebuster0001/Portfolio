import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5225/api';

const axiosClient = axios.create({
  baseURL,
});

export default axiosClient;
