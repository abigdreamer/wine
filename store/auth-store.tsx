import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  description?: string;
  preferences?: object;
}

interface ChatHistoryItem {
  id: string;
  text: string;
  answer?: string;
  confidence?: number;
  domain?: string;
  createdAt: string;
  isFavorite?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getUserHistory: (userId: string) => Promise<ChatHistoryItem[]>;
}

export const [AuthProvider, useAuth] = createContextHook<AuthState>(() => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const storedToken = await AsyncStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://agent.geniusai.biz/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = "Login failed";
        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
          errorMessage = data.detail[0].msg;
        }
        throw new Error(errorMessage);
      }

      const token = data.access_token;
      setToken(token);
      await AsyncStorage.setItem("token", token);

      // Fetch current user profile
      const meRes = await fetch("https://agent.geniusai.biz/api/auth/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!meRes.ok) throw new Error("Failed to fetch user");
      const meData = await meRes.json();

      const newUser: User = {
        id: meData.user_id,
        email: meData.email,
        name: meData.name,
        description: meData.description,
        preferences: meData.preferences,
      };

      setUser(newUser);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://agent.geniusai.biz/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: email.split("@")[0],
            email,
            password,
            description: "Registered from mobile app",
          }),
        }
      );

      const data = await response.json();

      console.log("Register response data:", data);

      if (!response.ok) {
        let errorMessage = "Registration failed";
        if (typeof data.detail === "string") {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
          errorMessage = data.detail[0].msg;
        }
        throw new Error(errorMessage);
      }

      // Save token if returned
      if (data.access_token) {
        setToken(data.access_token);
        await AsyncStorage.setItem("token", data.access_token);
      }

      const newUser: User = {
        id: data.user_id,
        email: data.email,
        name: data.name,
      };

      setUser(newUser);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getUserHistory = async (userId: string): Promise<ChatHistoryItem[]> => {
    try {
      if (!token) throw new Error("No token available");

      const response = await fetch(
        `https://agent.geniusai.biz/api/v1/users/${userId}/chat-history`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch history");
      const data = await response.json();

      return Array.isArray(data.chat_history) ? data.chat_history : [];
    } catch (error) {
      console.error("getUserHistory error:", error);
      return [];
    }
  };

  return {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    getUserHistory,
  };
});
