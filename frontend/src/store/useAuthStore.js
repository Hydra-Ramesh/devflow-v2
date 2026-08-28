import { create } from 'zustand';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        // /me returns { data: { id: "..." } } currently
        // map it to match user object
        set({ user: data.data.user || { id: data.data.id }, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, loading: false });
    }
  },

  signInWithEmail: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Login failed');
    
    set({ user: data.data.user });
    return data;
  },

  signUpWithEmail: async (email, password, metadata = {}) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...metadata }),
      credentials: 'include'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || 'Signup failed');
    
    set({ user: data.data.user });
    return data;
  },

  signOut: async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'DELETE',
      credentials: 'include'
    });
    set({ user: null });
  },
}));

export default useAuthStore;
