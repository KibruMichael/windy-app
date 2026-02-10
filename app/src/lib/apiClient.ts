// API Client for Express + Prisma backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Auth header
const authHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ============ AUTH ============

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const auth = {
  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const data = await fetchAPI<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    setToken(data.token);
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const data = await fetchAPI<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data;
  },

  logout: () => {
    removeToken();
  },

  me: async (): Promise<{ user: User }> => {
    return fetchAPI<{ user: User }>('/api/auth/me');
  },
};

// ============ COMMENTS ============

export interface Comment {
  id: string;
  commentText: string;
  mapLocation: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export const comments = {
  getAll: async (): Promise<Comment[]> => {
    return fetchAPI<Comment[]>('/api/comments');
  },

  create: async (commentText: string, mapLocation?: string): Promise<Comment> => {
    return fetchAPI<Comment>('/api/comments', {
      method: 'POST',
      body: JSON.stringify({ commentText, mapLocation }),
    });
  },
};

// ============ FAVORITES ============

export interface Favorite {
  id: string;
  locationName: string;
  coordinates: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const favorites = {
  getAll: async (): Promise<Favorite[]> => {
    return fetchAPI<Favorite[]>('/api/favorites');
  },

  create: async (locationName: string, coordinates: string): Promise<Favorite> => {
    return fetchAPI<Favorite>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify({ locationName, coordinates }),
    });
  },

  delete: async (id: string): Promise<void> => {
    await fetchAPI(`/api/favorites/${id}`, { method: 'DELETE' });
  },
};

// ============ RATINGS ============

export interface Rating {
  id: string;
  value: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const ratings = {
  getAll: async (): Promise<Rating[]> => {
    return fetchAPI<Rating[]>('/api/ratings');
  },

  createOrUpdate: async (value: number): Promise<Rating> => {
    return fetchAPI<Rating>('/api/ratings', {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  },
};

export default {
  auth,
  comments,
  favorites,
  ratings,
  getToken,
  setToken,
};
