import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mic, Send, Zap, MessageCircle, Clock } from "lucide-react-native";
import { useTheme } from "../store/theme-store";
import { useQuestions } from "../store/question-store";
import { HomeScreenProps, MainRoutes } from "../types/navigation";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const [question, setQuestion] = useState<string>("");
    const { colors } = useTheme();
    const { addQuestion } = useQuestions();

    const handleAskQuestion = () => {
        if (!question.trim()) return;

        const newQuestion = addQuestion(question);
        navigation.push(MainRoutes.LiveSession, { id: newQuestion.id })
        setQuestion("");
    };

    const quickActions = [
        {
            title: "Ask AI",
            subtitle: "Get instant answers",
            icon: Zap,
            color: colors.primary,
            onPress: () => { },
        },
        {
            title: "Live Session",
            subtitle: "Real-time chat",
            icon: MessageCircle,
            color: colors.success,
              onPress: () => navigation.push(MainRoutes.Sessions),
        },
        {
            title: "Browse History",
            subtitle: "Past conversations",
            icon: Clock,
            color: colors.warning,
              onPress: () => navigation.push(MainRoutes.History),
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={[styles.greeting, { color: colors.text }]}>
                        Hello! 👋
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        What would you like to know today?
                    </Text>
                </View>

                <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Ask me anything..."
                        placeholderTextColor={colors.textSecondary}
                        value={question}
                        onChangeText={setQuestion}
                        multiline
                        maxLength={500}
                    />

                    <View style={styles.inputActions}>
                        <TouchableOpacity style={[styles.micButton, { backgroundColor: colors.primaryLight }]}>
                            <Mic size={20} color={colors.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                { backgroundColor: question.trim() ? colors.primary : colors.border }
                            ]}
                            onPress={handleAskQuestion}
                            disabled={!question.trim()}
                        >
                            <Send size={20} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.quickActions}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Quick Actions
                    </Text>

                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.actionCard, { backgroundColor: colors.surface }]}
                            onPress={action.onPress}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: action.color + "20" }]}>
                                <action.icon size={24} color={action.color} />
                            </View>

                            <View style={styles.actionContent}>
                                <Text style={[styles.actionTitle, { color: colors.text }]}>
                                    {action.title}
                                </Text>
                                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                                    {action.subtitle}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 32,
    },
    greeting: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 22,
    },
    inputCard: {
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    input: {
        fontSize: 16,
        lineHeight: 22,
        minHeight: 80,
        textAlignVertical: "top",
        marginBottom: 16,
    },
    inputActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    micButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    quickActions: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 16,
    },
    actionCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 14,
    },
});