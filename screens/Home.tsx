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
import { getConfig } from "../store/config-storage";
import { HomeScreenProps, MainRoutes } from "../types/navigation";
import { useTranslation } from "react-i18next";
import { useHomeStyles } from "./Home.styles";

const { width } = Dimensions.get("window");

// Utility function to extract winery name from website URL
const getWineryName = (url?: string): string => {
  if (!url) return "Domaine Carneros";
  try {
    const hostname = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
  } catch {
    return "Domaine Carneros";
  }
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [question, setQuestion] = useState<string>("");
  const { colors } = useTheme();
  const { addQuestion } = useQuestions();
  const { t } = useTranslation();
  const { textStyles } = useFont();
  const styles = useHomeStyles();

  const handleAskQuestion = (customQuestionOrEvent?: string | any) => {
    // If it's an event (from button press), use the current question
    // Otherwise use the custom question passed in
    const questionText = typeof customQuestionOrEvent === 'string' 
      ? customQuestionOrEvent 
      : question.trim();
      
    if (!questionText) return;

    // Create a new question in the store
    const newQuestion = addQuestion(questionText);
    
    // Clear the input field
    setQuestion("");
    
    // Navigate to LiveSession with the new question ID
    navigation.push(MainRoutes.LiveSession, { id: newQuestion.id });
  };

  const quickActions = [
    {
      title: t("home.actions.askAi.title"),
      subtitle: t("home.actions.askAi.subtitle"),
      icon: Zap,
      color: colors.primary,
      onPress: async () => {
        // Get user config to access their website
        const config = await getConfig();
        const wineryName = getWineryName(config?.website);
        handleAskQuestion(`Tell me about ${wineryName} tours and tastings available on this page`);
      },
    },
    {
      title: t("home.actions.liveSession.title"),
      subtitle: t("home.actions.liveSession.subtitle"),
      icon: MessageCircle,
      color: colors.success,
      onPress: async () => {
        // Get user config to access their website
        const config = await getConfig();
        const wineryName = getWineryName(config?.website);
        const newQuestion = addQuestion(`Hello! I'd like to know more about ${wineryName}.`);
        console.log('Home: Created new question with status:', newQuestion.status);
        navigation.push(MainRoutes.LiveSession, { id: newQuestion.id });
      },
    },
    {
      title: t("home.actions.history.title"),
      subtitle: t("home.actions.history.subtitle"),
      icon: Clock,
      color: colors.warning,
      onPress: () => navigation.navigate(MainRoutes.History),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {t("home.greeting")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t("home.subtitle")}
          </Text>
        </View>

        <View style={[styles.inputCard, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("home.inputPlaceholder")}
            placeholderTextColor={colors.textSecondary}
            value={question}
            onChangeText={setQuestion}
            multiline
            maxLength={500}
          />

          <View style={styles.inputActions}>
            <TouchableOpacity
              style={[
                styles.micButton,
                { backgroundColor: colors.primaryLight },
              ]}
            >
              <Mic size={20} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: question.trim()
                    ? colors.primary
                    : colors.border,
                },
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
            {t("home.quickActions")}
          </Text>

          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={action.onPress}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: action.color + "20" },
                ]}
              >
                <action.icon size={24} color={action.color} />
              </View>

              <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  {action.title}
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
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
