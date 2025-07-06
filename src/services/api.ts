import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your server URL

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      AsyncStorage.multiRemove(['authToken', 'userData', 'walletData']);
    }
    return Promise.reject(error.response?.data || error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data: { identifier: string; password: string }) => 
    api.post('/auth/login', data),
  
  register: (data: any) => 
    api.post('/auth/register', data),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  verifyPin: (pin: string) => 
    api.post('/auth/verify-pin', { pin }),
};

// Wallet APIs
export const walletAPI = {
  getWallet: () => 
    api.get('/wallet'),
  
  updatePin: (currentPin: string, newPin: string) => 
    api.put('/wallet/pin', { currentPin, newPin }),
  
  addCard: (cardData: any) => 
    api.post('/wallet/cards', cardData),
  
  removeCard: (cardId: string) => 
    api.delete(`/wallet/cards/${cardId}`),
  
  setDefaultCard: (cardId: string) => 
    api.put(`/wallet/cards/${cardId}/default`),
};

// Transaction APIs
export const transactionAPI = {
  getTransactions: (params?: any) => 
    api.get('/transactions', { params }),
  
  getTransaction: (transactionId: string) => 
    api.get(`/transactions/${transactionId}`),
  
  sendMoney: (data: any) => 
    api.post('/mpesa/send-money', data),
  
  topUpWallet: (data: any) => 
    api.post('/mpesa/stk-push', data),
  
  getTransactionStatus: (transactionId: string) => 
    api.get(`/mpesa/transaction/${transactionId}/status`),
};

// Payment APIs
export const paymentAPI = {
  payTill: (data: any) => 
    api.post('/payments/till', data),
  
  payMerchant: (data: any) => 
    api.post('/payments/merchant', data),
  
  generateQR: (amount: number, description?: string) => 
    api.post('/payments/generate-qr', { amount, description }),
};

// User APIs
export const userAPI = {
  searchUsers: (query: string) => 
    api.get('/users/search', { params: { q: query } }),
  
  updateProfile: (data: any) => 
    api.put('/users/profile', data),
};

export default api;