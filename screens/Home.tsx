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
import { useTheme } from "../theme/theme-context";
import { useFont } from "../theme/font-context";
import { useQuestions } from "../store/question-store";
import { HomeScreenProps, MainRoutes } from "../types/navigation";
import { useTranslation } from "react-i18next";
import { useHomeStyles } from "./Home.styles";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }: HomeScreenProps) {
    const [question, setQuestion] = useState<string>("");
    const { colors } = useTheme();
    const { addQuestion } = useQuestions();
    const { t } = useTranslation();
    const { textStyles } = useFont();
    const styles = useHomeStyles();

    const handleAskQuestion = () => {
        if (!question.trim()) return;

        const newQuestion = addQuestion(question);
        navigation.push(MainRoutes.LiveSession, { id: newQuestion.id })
        setQuestion("");
    };

    const quickActions = [
        {
            title: t('home.actions.askAi.title'),
            subtitle: t('home.actions.askAi.subtitle'),
            icon: Zap,
            color: colors.primary,
            onPress: () => { },
        },
        {
            title: t('home.actions.liveSession.title'),
            subtitle: t('home.actions.liveSession.subtitle'),
            icon: MessageCircle,
            color: colors.success,
            onPress: () => navigation.push(MainRoutes.Sessions),
        },
        {
            title: t('home.actions.history.title'),
            subtitle: t('home.actions.history.subtitle'),
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
                        {t('home.greeting')}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {t('home.subtitle')}
                    </Text>
                </View>

                <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder={t('home.inputPlaceholder')}
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
                        {t('home.quickActions')}
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

// Styles are now imported from Home.styles.ts