import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "../store/auth-store";
import { useTheme } from "../store/theme-store";
import { LoginScreenProps } from "../types/navigation";
import { MainRoutes } from "../types/navigation";

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const { login, register } = useAuth();
    const { colors } = useTheme();

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            navigation.replace(MainRoutes.BottomTab)
        } catch (error) {
            Alert.alert("Error", "Authentication failed");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </Text>

                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {isLogin ? "Sign in to continue" : "Join us to get started"}
                    </Text>

                    <View style={styles.form}>
                        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                            <Mail size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Email"
                                placeholderTextColor={colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={[styles.inputContainer, { borderColor: colors.border }]}>
                            <Lock size={20} color={colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="Password"
                                placeholderTextColor={colors.textSecondary}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff size={20} color={colors.textSecondary} />
                                ) : (
                                    <Eye size={20} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary }]}
                            onPress={handleSubmit}
                        >
                            <Text style={[styles.buttonText, { color: colors.white }]}>
                                {isLogin ? "Sign In" : "Create Account"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => setIsLogin(!isLogin)}
                        >
                            <Text style={[styles.switchText, { color: colors.primary }]}>
                                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 48,
    },
    form: {
        width: "100%",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 24,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    switchButton: {
        alignItems: "center",
    },
    switchText: {
        fontSize: 14,
        fontWeight: "500",
    },
});