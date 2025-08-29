import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageCircle, Clock, TrendingUp } from "lucide-react-native";
import { useTheme } from "../theme/theme-context";
import { useQuestions } from "../store/question-store";
import { Question } from "../types/question";
import { MainRoutes, SessionsScreenProps } from "../types/navigation";
import { useTranslation } from "react-i18next";

export default function SessionsScreen({ navigation }: SessionsScreenProps) {
    const { colors } = useTheme();
    const { questions } = useQuestions();
    const { t } = useTranslation();

    const activeSessions = questions.filter(q => q.status === "active");

    const renderSession = ({ item }: { item: Question }) => (
        <TouchableOpacity
            style={[styles.sessionCard, { backgroundColor: colors.surface }]}
            onPress={() => navigation.push(MainRoutes.LiveSession, { id: item.id })}
        >
            <View style={styles.sessionHeader}>
                <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
                    <Text style={[styles.statusText, { color: colors.success }]}>
                        {t('common.active')}
                    </Text>
                </View>
                <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                    {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
            </View>

            <Text style={[styles.questionText, { color: colors.text }]} numberOfLines={2}>
                {item.text}
            </Text>

            <View style={styles.sessionFooter}>
                <View style={styles.sessionStats}>
                    <Clock size={16} color={colors.textSecondary} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>
                        {t('common.minutesAgo', { minutes: Math.floor((Date.now() - item.createdAt) / 60000) })}
                    </Text>
                </View>

                <View style={styles.sessionStats}>
                    <TrendingUp size={16} color={colors.primary} />
                    <Text style={[styles.statText, { color: colors.primary }]}>
                        {t('common.confidence', { percent: item.confidence })}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {t('sessions.title')}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {t('sessions.subtitle', { count: activeSessions.length })}
                </Text>
            </View>

            {activeSessions.length === 0 ? (
                <View style={styles.emptyState}>
                    <MessageCircle size={64} color={colors.textSecondary} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>
                        {t('sessions.empty.title')}
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                        {t('sessions.empty.subtitle')}
                    </Text>

                    <TouchableOpacity
                        style={[styles.startButton, { backgroundColor: colors.primary }]}
                        // onPress={() => router.push("/(tabs)/home")}
                    >
                        <Text style={[styles.startButtonText, { color: colors.white }]}>
                            {t('sessions.empty.action')}
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={activeSessions}
                    renderItem={renderSession}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.sessionsList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
    },
    sessionsList: {
        paddingHorizontal: 24,
    },
    sessionCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    sessionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    timestamp: {
        fontSize: 12,
    },
    questionText: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 16,
    },
    sessionFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    sessionStats: {
        flexDirection: "row",
        alignItems: "center",
    },
    statText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: "500",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 24,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
    },
    startButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});