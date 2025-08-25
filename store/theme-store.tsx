import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

interface Colors {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    white: string;
    black: string;
}

interface ThemeState {
    isDark: boolean;
    colors: Colors;
    toggleTheme: () => void;
}

const lightColors: Colors = {
    primary: "#3B82F6",
    primaryLight: "#DBEAFE",
    primaryDark: "#1E40AF",
    secondary: "#6B7280",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    white: "#FFFFFF",
    black: "#000000",
};

const darkColors: Colors = {
    primary: "#60A5FA",
    primaryLight: "#1E3A8A",
    primaryDark: "#93C5FD",
    secondary: "#9CA3AF",
    background: "#111827",
    surface: "#1F2937",
    text: "#F9FAFB",
    textSecondary: "#9CA3AF",
    border: "#374151",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    white: "#FFFFFF",
    black: "#000000",
};

export const [ThemeProvider, useTheme] = createContextHook<ThemeState>(() => {
    const [isDark, setIsDark] = useState<boolean>(false);

    useEffect(() => {
        loadStoredTheme();
    }, []);

    const loadStoredTheme = async () => {
        try {
            const storedTheme = await AsyncStorage.getItem("theme");
            if (storedTheme) {
                setIsDark(storedTheme === "dark");
            }
        } catch (error) {
            console.error("Error loading stored theme:", error);
        }
    };

    const toggleTheme = async () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        try {
            await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
        } catch (error) {
            console.error("Error saving theme:", error);
        }
    };

    return {
        isDark,
        colors: isDark ? darkColors : lightColors,
        toggleTheme,
    };
});