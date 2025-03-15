import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';


const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      path: error.config?.url
    });

    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
export default api;

// Auth APIs
export const loginAdmin = async (credentials) => {

  try {
    const response = await api.post('/auth/admin/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};
export const changeClientPassword = async (clientId,data) => {

  try {
    const response = await api.post(`/auth/admin/change-password/${clientId}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};
export const deleteClient = async (clientId) => {

  try {
    const response = await api.delete(`/auth/admin/client/${clientId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};


// Client Management APIs
export const createClient = async (clientData) => {
  try {
    const response = await api.post('/admin/clients', clientData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create client');
  }
};


export const getAllClients = async () => {
  try {
    const response = await api.get('/admin/clients', {
      params: {
        sortBy: 'army_id',
        sortOrder: 'asc'
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch clients');
  }
};

// Data Management APIs
export const getDataTypes = async () => {
  try {
    const response = await api.get('/admin/data-types');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch data types');
  }
};

export const addDataType = async (dataType) => {
  try {
    const response = await api.post('/admin/data-types', dataType);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add data type');
  }
};

export const getClientLastData = async (clientId) => {
  try {
    const response = await api.get(`/admin/clients/${clientId}/last-data`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch last data');
  }
};

export const fetchDataByDate = async (clientId, date) => {
  try {
    const response = await api.get(`/admin/clients/${clientId}/data/${date}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch data by date');
  }
};
export const recordClientData = async (clientId, data) => {
  try {
    const response = await api.post(`/admin/clients/${clientId}/data`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to record data');
  }
};

// Dashboard Stats APIs
export const getDashboardStats = async () => {
  const response = await api.get('/admin/dashboard/stats');
  return response.data;
};

// Analysis APIs
export const getClientAnalysis = async (clientId) => {
  const response = await api.get(`/admin/clients/${clientId}/analysis`);
  return response.data;
};

export const searchClients = async (searchTerm) => {
  try {
    console.log('Sending search request for:', searchTerm); // Debug log
    const response = await api.get('/admin/clients/search', {
      params: { search: searchTerm }
    });
    console.log('Search response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.details || 
      'Failed to search clients'
    );
  }
};

export const updateClientDetails = async (clientId, details) => {
  const response = await api.put(`/admin/clients/${clientId}`, details);
  return response.data;

};

export const getClientById = async (clientId) => {
  const response = await api.get(`/admin/clients/${clientId}`);
  return response.data;
}; 