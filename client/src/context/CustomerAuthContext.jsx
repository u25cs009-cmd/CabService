import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerAuthContext = createContext(null);

const TOKEN_KEY = 'pipippip_customer_token';
const USER_KEY = 'pipippip_customer_user';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function CustomerAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      fetch(`${API_BASE_URL}/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            setCustomer(json.data);
            localStorage.setItem(USER_KEY, JSON.stringify(json.data));
          }
        })
        .catch(() => {});
    } else {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setCustomer(null);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Login failed');
      }
      setToken(json.token);
      setCustomer(json.user);
      localStorage.setItem(TOKEN_KEY, json.token);
      localStorage.setItem(USER_KEY, JSON.stringify(json.user));
      return json;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Registration failed');
      }
      setToken(json.token);
      setCustomer(json.user);
      localStorage.setItem(TOKEN_KEY, json.token);
      localStorage.setItem(USER_KEY, JSON.stringify(json.user));
      return json;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken('');
    setCustomer(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
