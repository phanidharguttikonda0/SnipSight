import axios from "axios"
import type { AxiosRequestConfig, AxiosResponse } from "axios"

export const API_BASE_URL = "https://api.snipsight.phani.services"
export const API_SHORTEN_URL = "https://snipsight.phani.services"

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
})

// Add auth token to ALL requests except sign-in and sign-up
api.interceptors.request.use((config: AxiosRequestConfig) => {
  // Do not add Authorization header for sign-in or sign-up
  if (
    config.url?.includes("/authentication/sign-in") ||
    config.url?.includes("/authentication/sign-up")
  ) {
    return config;
  }
  const token = localStorage.getItem("authHeader");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = token; // Use the full header value (e.g., "Bearer xyz123")
  }
  return config;
});

// Handle token expiration and unauthorized responses
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user_data")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  signIn: (username: string, password: string) => api.post("/authentication/sign-in", { username, password }),

  signUp: (data: {
    username: string
    password: string
    mail_id: string
    mobile: string
    country_id: number
  }) => api.post("/authentication/sign-up", data),
}

// URL Shortener API
export const urlAPI = {
  createUrl: (original_url: string, custom_url?: string) =>
    api.post("/url-shortner/create-url", { original_url, custom_url }),

  getUrls: (page_size = 10, page_number = 1) =>
    api.get("/url-shortner/get-urls", {
      params: { page_size, page_number },
    }),

  updateUrl: (id: number, new_name: string) => api.get(`/url-shortner/update-url/${id}/${new_name}`),

  deleteUrl: (id: number) => api.get(`/url-shortner/delete-url/${id}`),

  getKeyInsights: (shorten_url: string, page_size: number, last_evaluated_key: string) => api.get(`/url-shortner/key-insights/${shorten_url}/${page_size}/${last_evaluated_key}`),
}

export default api
