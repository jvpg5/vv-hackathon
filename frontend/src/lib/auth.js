// Authentication utilities for Strapi integration

const API_BASE_URL = "http://localhost:1337/api";

export const auth = {
  // Get stored token
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  // Get stored user
  getUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!auth.getToken();
  },

  // Logout user
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },

  // Login user
  login: async (identifier, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, data };
    } else {
      return { success: false, error: data.error?.message || "Login failed" };
    }
  },

  // Register user
  register: async (username, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.jwt);
      localStorage.setItem("user", JSON.stringify(data.user));
      return { success: true, data };
    } else {
      return { success: false, error: data.error?.message || "Registration failed" };
    }
  },

  // Get user profile
  getProfile: async () => {
    const token = auth.getToken();
    if (!token) return { success: false, error: "No token found" };

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error?.message || "Failed to get profile" };
    }
  },

  // Make authenticated request
  authenticatedFetch: async (url, options = {}) => {
    const token = auth.getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    };

    return fetch(url, { ...options, ...defaultOptions });
  },
};

export default auth;
