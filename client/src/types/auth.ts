// src/types/auth.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;        // Keeping for future OTP
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;        // Required for registration
}

export interface ErrorResponse {
  message: string;
}

export interface StoredAuth {
  token: string;
  user: User;
  expiresAt: number;
}