import { api } from "./client";
import { AxiosResponse } from "axios";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  first_name: string;
  last_name: string;
  role: "farmer" | "supplier" | "agronomist" | "extension_officer";
  username: string;
  password2: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

const AUTH_ENDPOINTS = {
  login: "/auth/token/",
  register: "/auth/register/",
  refresh: "/auth/token/refresh/",
  me: "/auth/me/",
} as const;

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      AUTH_ENDPOINTS.login,
      credentials
    );
    return response.data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(
      AUTH_ENDPOINTS.register,
      userData
    );
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ access: string }> {
    const response = await api.post<{ access: string }>(
      AUTH_ENDPOINTS.refresh,
      { refresh: refreshToken }
    );
    return response.data;
  },

  async getCurrentUser(): Promise<AuthResponse["user"]> {
    const response = await api.get<AuthResponse["user"]>(AUTH_ENDPOINTS.me);
    return response.data;
  },

  setAuthHeader(token: string): void {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  clearAuthHeader(): void {
    delete api.defaults.headers.common["Authorization"];
  },

  // Token management
  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  },

  setTokens(access: string, refresh: string): void {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
  },

  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },

  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  },

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  // Logout
  logout(): void {
    this.clearTokens();
    this.clearAuthHeader();
  },
};

// Initialize axios auth header if token exists
const token = authService.getAccessToken();
if (token) {
  authService.setAuthHeader(token);
}
