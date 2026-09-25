import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, setUser, loading, setLoading } = context;
  const [authError, setAuthError] = useState(null);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await login({ email, password });
      if (data?.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      const err = "Login failed: No user returned";
      setAuthError(err);
      return { success: false, error: err };
    } catch (err) {
      const message = err.message || "Invalid email or password";
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const data = await register({ username, email, password });
      if (data?.user) {
        setUser(data.user);
        return { success: true, user: data.user };
      }
      const err = "Registration failed";
      setAuthError(err);
      return { success: false, error: err };
    } catch (err) {
      const message = err.message || "Registration failed";
      setAuthError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      return { success: true };
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const getAndSetUser = async () => {
      try {
        const data = await getMe();
        if (isMounted) {
          setUser(data?.user || null);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getAndSetUser();

    return () => {
      isMounted = false;
    };
  }, [setUser, setLoading]);

  return {
    user,
    loading,
    authError,
    setAuthError,
    handleRegister,
    handleLogin,
    handleLogout,
  };
};
