import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme-context";
import { MainRoutes, PreferencesScreenProps } from "../types/navigation";
import { saveConfig } from "../store/config-storage";

const personalities = ["Friendly", "Professional", "Humorous", "Casual"];
const languages = ["English", "Spanish", "French", "German", "Chinese"];

export default function Preferences({ navigation }: PreferencesScreenProps) {
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(
    null
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const { colors } = useTheme();

  const handleContinue = async () => {
    if (!selectedPersonality || !selectedLanguage) {
      Alert.alert("Error", "Please select both personality and language");
      return;
    }

    await saveConfig({
      personality: selectedPersonality,
      language: selectedLanguage,
    });
    // save preferences to store if needed
    navigation.replace(MainRoutes.UserInfo);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>
          Personalize Your Assistant
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose your assistant's personality and preferred language
        </Text>

        {/* Personality Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Select Personality
        </Text>
        <View style={styles.optionsContainer}>
          {personalities.map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                selectedPersonality === p && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedPersonality(p)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text },
                  selectedPersonality === p && { color: colors.white },
                ]}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Language Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Select Language
        </Text>
        <View style={styles.optionsContainer}>
          {languages.map((l) => (
            <TouchableOpacity
              key={l}
              style={[
                styles.optionButton,
                { borderColor: colors.border },
                selectedLanguage === l && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setSelectedLanguage(l)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text },
                  selectedLanguage === l && { color: colors.white },
                ]}
              >
                {l}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primary },
            !(selectedPersonality && selectedLanguage) && { opacity: 0.5 },
          ]}
          disabled={!selectedPersonality || !selectedLanguage}
          onPress={handleContinue}
        >
          <Text style={[styles.continueText, { color: colors.white }]}>
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 20,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    margin: 6,
  },
  optionText: {
    fontSize: 16,
  },
  continueButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  continueText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
