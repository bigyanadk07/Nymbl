// src/services/auth.service.ts

import apiClient from '../utils/api';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ErrorResponse,
} from '../types/auth';
import { AxiosError } from 'axios';

export class AuthService {
  // Login with email + password
  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      } as LoginRequest);
      
      this.storeAuthData(response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const message = axiosError.response?.data?.message || 'Login failed';
      throw new Error(message);
    }
  }

  // Register with name, email, password, phone
  static async register(
    name: string, 
    email: string, 
    password: string, 
    phone: string
  ): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
        phone,
      } as RegisterRequest);
      
      this.storeAuthData(response.data);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const message = axiosError.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const message = axiosError.response?.data?.message || 'Failed to get user';
      throw new Error(message);
    }
  }

  // Store auth data in localStorage
  private static storeAuthData(data: AuthResponse): void {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem('expiresAt', String(expiresAt));
  }

  // Logout
  static logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiresAt');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const expiresAt = localStorage.getItem('expiresAt');
    
    if (!token) return false;
    
    if (expiresAt) {
      return Date.now() < parseInt(expiresAt, 10);
    }
    
    return true;
  }

  // Get stored user
  static getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  // Get stored token
  static getStoredToken(): string | null {
    return localStorage.getItem('token');
  }

  // 🔮 Future OTP methods (placeholder for later)
  // static async sendOtp(phone: string): Promise<void> { ... }
  // static async verifyOtp(phone: string, code: string): Promise<AuthResponse> { ... }
}

export default AuthService;