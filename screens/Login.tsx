import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "../store/auth-store";
import { LoginScreenProps, MainRoutes } from "../types/navigation";
import { styles } from "../style/styles";
import { useTheme } from "@ui-kitten/components";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuestions } from "../store/question-store";

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const { login, register, isLoading } = useAuth();
  const { clearAllQuestions } = useQuestions();
  const colors = useTheme();

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 8 && !isLogin) {
      Alert.alert("Error", "Password must be at least 8 characters long");
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
        // For new user registrations, clear any existing config
        await AsyncStorage.removeItem("userConfig");
        // No need to clear questions here as each user has their own questions storage
      }
      navigation.replace(MainRoutes.Preferences);
    } catch (error: any) {
      let message = "Authentication failed";
      if (error?.message) {
        message = error.message;
      }
      Alert.alert("Error", message);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors["color-basic-000"] }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors["color-basic-900"] }]}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </Text>

          <Text style={[styles.subtitle, { color: colors["color-basic-600"] }]}>
            {isLogin ? "Sign in to continue" : "Join us to get started"}
          </Text>

          <View style={styles.form}>
            {/* Email Input */}
            <View
              style={[
                styles.inputContainer,
                { borderColor: colors["color-basic-400"] },
              ]}
            >
              <Mail size={20} color={colors["color-basic-600"]} />
              <TextInput
                style={[styles.input, { color: colors["color-basic-900"] }]}
                placeholder="Email"
                placeholderTextColor={colors["color-basic-600"]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View
              style={[
                styles.inputContainer,
                { borderColor: colors["color-basic-400"] },
              ]}
            >
              <Lock size={20} color={colors["color-basic-600"]} />
              <TextInput
                style={[styles.input, { color: colors["color-basic-900"] }]}
                placeholder="Password"
                placeholderTextColor={colors["color-basic-600"]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color={colors["color-basic-600"]} />
                ) : (
                  <Eye size={20} color={colors["color-basic-600"]} />
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors["color-primary-500"] },
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors["color-basic-100"]} />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    { color: colors["color-basic-100"] },
                  ]}
                >
                  {isLogin ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Switch between Login / Signup */}
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.switchText,
                  { color: colors["color-primary-500"] },
                ]}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
