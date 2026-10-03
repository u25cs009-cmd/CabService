import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DriverAuthContext = createContext(null);

export const DriverAuthProvider = ({ children }) => {
  const [driverToken, setDriverToken] = useState(() => localStorage.getItem('driver_token') || '');
  const [driver, setDriver] = useState(() => {
    const saved = localStorage.getItem('driver_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDriverProfile = useCallback(async (token) => {
    const activeToken = token || driverToken;
    if (!activeToken) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/driver/me', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (data.success && data.driver) {
        setDriver(data.driver);
        localStorage.setItem('driver_user', JSON.stringify(data.driver));
      } else {
        // Invalid token
        logout();
      }
    } catch (err) {
      console.error('Error fetching driver profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [driverToken]);

  useEffect(() => {
    if (driverToken) {
      fetchDriverProfile(driverToken);
    } else {
      setIsLoading(false);
    }
  }, [driverToken, fetchDriverProfile]);

  // Periodic Location Updates when online
  useEffect(() => {
    if (!driverToken || !driver?.isOnline) return;

    const sendLocation = (coords) => {
      const { longitude, latitude } = coords;
      fetch('/api/driver/location', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${driverToken}`
        },
        body: JSON.stringify({ lng: longitude, lat: latitude })
      }).catch((err) => console.error('GPS update failed:', err));
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendLocation(pos.coords),
        () => console.warn('Geolocation access denied or unavailable'),
        { enableHighAccuracy: true }
      );

      const watchId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => sendLocation(pos.coords),
          () => {},
          { enableHighAccuracy: true }
        );
      }, 15000); // Send GPS every 15 seconds

      return () => clearInterval(watchId);
    }
  }, [driverToken, driver?.isOnline]);

  const login = async (identifier, password) => {
    const res = await fetch('/api/driver/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (data.success) {
      setDriverToken(data.token);
      setDriver(data.driver);
      localStorage.setItem('driver_token', data.token);
      localStorage.setItem('driver_user', JSON.stringify(data.driver));
      return { success: true };
    }
    return { success: false, message: data.message || 'Login failed' };
  };

  const changePassword = async (newPassword) => {
    const res = await fetch('/api/driver/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driverToken}`
      },
      body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (data.success) {
      setDriver((prev) => prev ? { ...prev, isMustChangePassword: false } : null);
      return { success: true };
    }
    return { success: false, message: data.message || 'Password update failed' };
  };

  const toggleOnline = async (isOnline) => {
    const res = await fetch('/api/driver/toggle-online', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${driverToken}`
      },
      body: JSON.stringify({ isOnline })
    });
    const data = await res.json();
    if (data.success && data.driver) {
      setDriver(data.driver);
      localStorage.setItem('driver_user', JSON.stringify(data.driver));
      return { success: true, driver: data.driver };
    }
    return { success: false, message: data.message || 'Failed to toggle status' };
  };

  const logout = () => {
    setDriverToken('');
    setDriver(null);
    localStorage.removeItem('driver_token');
    localStorage.removeItem('driver_user');
  };

  return (
    <DriverAuthContext.Provider
      value={{
        driverToken,
        driver,
        isLoading,
        login,
        logout,
        changePassword,
        toggleOnline,
        refetchDriver: () => fetchDriverProfile(driverToken)
      }}
    >
      {children}
    </DriverAuthContext.Provider>
  );
};

export const useDriverAuth = () => useContext(DriverAuthContext);
