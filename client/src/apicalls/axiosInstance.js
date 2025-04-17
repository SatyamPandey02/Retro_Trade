import axios from 'axios';
import { message } from 'antd';

export const axiosInstance = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to set the token dynamically
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle token-related errors
            if (error.response.status === 401) {
                // Clear token and redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
                message.error('Session expired. Please login again.');
            } else {
                // Handle other API errors
                console.error('API Error:', error.response.data);
                message.error(error.response.data.message || 'Something went wrong');
            }
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network Error:', error.request);
            message.error('Network error. Please check your connection.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
            message.error('Something went wrong');
        }
        return Promise.reject(error);
    }
);
