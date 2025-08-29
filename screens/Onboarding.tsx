import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import LinearGradient from 'react-native-linear-gradient';
import { Brain, Zap, MessageCircle } from "lucide-react-native";
import { MainRoutes, OnboardingScreenProps } from "../types/navigation";
import { useTheme } from "../theme/theme-context";
const { width, height } = Dimensions.get("window");

export default function OnboardingScreen({ navigation }: OnboardingScreenProps) {
    const { colors } = useTheme();

    return (
        <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Brain size={80} color={colors.white} />
                </View>

                <Text style={[styles.title, { color: colors.white }]}>
                    AI Q&A Concierge
                </Text>

                <Text style={[styles.subtitle, { color: colors.white + "CC" }]}>
                    Get instant, intelligent answers to any question with real-time AI Concierge
                </Text>

                <View style={styles.featuresContainer}>
                    <View style={styles.feature}>
                        <Zap size={24} color={colors.white} />
                        <Text style={[styles.featureText, { color: colors.white }]}>
                            Lightning Fast Responses
                        </Text>
                    </View>

                    <View style={styles.feature}>
                        <MessageCircle size={24} color={colors.white} />
                        <Text style={[styles.featureText, { color: colors.white }]}>
                            Real-time Chat Sessions
                        </Text>
                    </View>

                    <View style={styles.feature}>
                        <Brain size={24} color={colors.white} />
                        <Text style={[styles.featureText, { color: colors.white }]}>
                            Advanced AI Intelligence
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.white }]}
                    onPress={() => navigation.navigate(MainRoutes.Login)}
                >
                    <Text style={[styles.buttonText, { color: colors.primary }]}>
                        Get Started
                    </Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    iconContainer: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 48,
    },
    featuresContainer: {
        width: "100%",
        marginBottom: 48,
    },
    feature: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    featureText: {
        fontSize: 16,
        marginLeft: 12,
        fontWeight: "500",
    },
    button: {
        width: width - 64,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: "600",
    },
});