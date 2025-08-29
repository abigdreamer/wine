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
import { Select, SelectItem, IndexPath } from '@ui-kitten/components';
import { ChevronLeft } from 'lucide-react-native';
import { useTheme } from "../theme/theme-context";
import { useFont } from "../theme/font-context";
import type { FontType } from "../theme/font-context";
import { MainRoutes, PreferencesScreenProps } from "../types/navigation";
import { saveConfig, getConfig } from "../store/config-storage";
import { useTranslation } from 'react-i18next';
import '../i18n/config';

// Force immediate initialization of i18n
import i18n from '../i18n/config';

const personalities = ["Friendly", "Professional", "Humorous", "Casual"];
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' }
];

const themes = [
  { code: 'light', name: 'Light' },
  { code: 'dark', name: 'Dark' }
];

const fonts = [
  { code: 'helvetica', name: 'Helvetica' },
  { code: 'roboto', name: 'Roboto' },
  { code: 'openSans', name: 'Open Sans' },
  { code: 'patrickHand', name: 'Patrick Hand' }
];

export default function Preferences({ navigation }: PreferencesScreenProps) {
  const [selectedPersonality, setSelectedPersonality] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [selectedFont, setSelectedFont] = useState<string>('');
  const { colors, setTheme } = useTheme();
  const { textStyles, setFont } = useFont();
  const { t, i18n } = useTranslation();

  // Load initial preferences
  useEffect(() => {
    const loadInitialPreferences = async () => {
      try {
        const config = await getConfig();
        if (config) {
          if (config.personality) setSelectedPersonality(config.personality);
          if (config.language) setSelectedLanguage(config.language);
          if (config.theme) setSelectedTheme(config.theme);
          if (config.font) setSelectedFont(config.font);
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    
    loadInitialPreferences();
  }, []);

  const handleLanguageChange = (langCode: string) => {
    if (!langCode) return;
    setSelectedLanguage(langCode);
  };

  const handleThemeChange = (themeCode: string) => {
    setSelectedTheme(themeCode);
  };

  const handleFontChange = (fontCode: string) => {
    setSelectedFont(fontCode);
    setFont(fontCode as FontType);
  };

  const handleContinue = async () => {
    if (!selectedPersonality || !selectedLanguage || !selectedTheme || !selectedFont) {
      Alert.alert(t('error'), t('preferences.selectBoth'));
      return;
    }

    try {
      // First apply language change to ensure proper translation of any error messages
      if (selectedLanguage !== i18n.language) {
        await i18n.changeLanguage(selectedLanguage);
      }

      // Save all preferences
      await saveConfig({
        personality: selectedPersonality,
        language: selectedLanguage,
        theme: selectedTheme,
        font: selectedFont,
      });

      // Apply theme change
      setTheme(selectedTheme as 'light' | 'dark');

      // Log confirmation of changes
      console.log('Preferences applied:', {
        language: selectedLanguage,
        theme: selectedTheme,
        font: selectedFont,
        personality: selectedPersonality
      });

      // Navigate to main app navigation
      navigation.navigate(MainRoutes.BottomTab);
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert(t('error'), t('preferences.saveError'));
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ChevronLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }, textStyles.title]}>
          {t('preferences.title')}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }, textStyles.subtitle]}>
          {t('preferences.subtitle')}
        </Text>

        {/* Personality Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }, textStyles.button]}>
          {t('preferences.selectPersonality')}
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
          {t('preferences.selectLanguage')}
        </Text>
        <Select
          style={styles.select}
          placeholder={t('preferences.selectLanguagePrompt')}
          value={selectedLanguage ? languages.find(lang => lang.code === selectedLanguage)?.name : ''}
          onSelect={index => handleLanguageChange(languages[(index as IndexPath).row].code)}
        >
          {languages.map(lang => (
            <SelectItem key={lang.code} title={lang.name} />
          ))}
        </Select>

        {/* Theme Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('preferences.selectTheme')}
        </Text>
        <Select
          style={styles.select}
          placeholder={t('preferences.selectThemePrompt')}
          value={selectedTheme ? themes.find(theme => theme.code === selectedTheme)?.name : ''}
          onSelect={index => handleThemeChange(themes[(index as IndexPath).row].code)}
        >
          {themes.map(theme => (
            <SelectItem key={theme.code} title={theme.name} />
          ))}
        </Select>

        {/* Font Section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('preferences.selectFont')}
        </Text>
        <Select
          style={styles.select}
          placeholder={t('preferences.selectFontPrompt')}
          value={selectedFont ? fonts.find(font => font.code === selectedFont)?.name : ''}
          onSelect={index => handleFontChange(fonts[(index as IndexPath).row].code)}
        >
          {fonts.map(font => (
            <SelectItem key={font.code} title={font.name} />
          ))}
        </Select>

        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: colors.primary },
            !(selectedPersonality && selectedLanguage && selectedLanguage !== '') && { opacity: 0.5 },
          ]}
          disabled={!selectedPersonality || !selectedLanguage}
          onPress={handleContinue}
        >
          <Text style={[styles.continueText, { color: colors.white }]}>
            {t('common.continue')}
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
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
  select: {
    marginBottom: 24,
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
