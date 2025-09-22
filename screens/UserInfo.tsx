import React, { useState, useEffect } from "react";
import {
  Platform,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme-context";
import { MainRoutes, UserInfoScreenProps } from "../types/navigation";
import { User, Globe, ChevronLeft } from "lucide-react-native";
import { saveConfig, getConfig } from "../store/config-storage";

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingLeft: 48,
    fontSize: 16,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    height: '100%',
    justifyContent: 'center',
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.13,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
});

export default function UserInfo({ navigation }: UserInfoScreenProps) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [loadingFavicon, setLoadingFavicon] = useState(false);
  const { colors } = useTheme();

  // Load existing config values if available, but only for returning users
  useEffect(() => {
    const loadConfig = async () => {
      const config = await getConfig();
      // Only load saved values if both name and website exist
      // This ensures new signups get empty fields
      if (config && config.name && config.website) {
        setName(config.name);
        setWebsite(config.website);
        fetchFavicon(config.website);
      }
    };
    
    loadConfig();
  }, []);

  const fetchFavicon = (url: string) => {
    if (!url) return;
    
    try {
      setLoadingFavicon(true);
      
      // Parse the URL to get the domain
      let domain = url;
      if (!domain.startsWith('http')) {
        domain = 'https://' + domain;
      }
      
      // Extract hostname from URL string without using URL object properties
      let hostname = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      
      // Different favicon services we can try
      // 1. Google's favicon service
      const googleFaviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
      
      // Set the favicon URL
      setFaviconUrl(googleFaviconUrl);
    } catch (error) {
      console.error('Error parsing URL:', error);
      setFaviconUrl(null);
    } finally {
      setLoadingFavicon(false);
    }
  };

  // Update favicon when website changes
  useEffect(() => {
    if (website) {
      fetchFavicon(website);
    } else {
      setFaviconUrl(null);
    }
  }, [website]);

  const handleContinue = async () => {
    if (!name || !website) {
      // Using UI Kitten Modal would be better here, but for now keeping it simple
      return;
    }

    await saveConfig({ name, website });
    navigation.replace(MainRoutes.BottomTab);
  };

  const isDisabled = !name.trim() || !website.trim();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            User Info
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.keyboardView}>
            <Text style={[styles.title, { color: colors.text }]}>
              Almost there!
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Please tell us your name and website to complete your profile setup
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Your Name
              </Text>
              <View>
                <TextInput
                  value={name}
                  placeholder='Enter your name'
                  onChangeText={setName}
                  style={[
                    styles.input,
                    {
                      borderColor: name ? colors.primary : colors.border,
                      color: colors.text,
                      backgroundColor: colors.background
                    }
                  ]}
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
                <View style={styles.inputIcon}>
                  <User
                    size={20}
                    color={name ? colors.primary : colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                Website
              </Text>
              <View>
                <TextInput
                  value={website}
                  placeholder='Enter your winery website (e.g., https://www.example.com)'
                  onChangeText={setWebsite}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  style={[
                    styles.input,
                    {
                      borderColor: website ? colors.primary : colors.border,
                      color: colors.text,
                      backgroundColor: colors.background
                    }
                  ]}
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
                <View style={styles.inputIcon}>
                  <Globe
                    size={20}
                    color={website ? colors.primary : colors.textSecondary}
                  />
                </View>
              </View>
            </View>

            <View
              style={{
                alignItems: 'center',
                height: 100,
                justifyContent: 'center',
                marginVertical: 20,
              }}>
              {loadingFavicon ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : faviconUrl ? (
                <Image
                  source={{ uri: faviconUrl }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 10,
                  }}
                  resizeMode="contain"
                />
              ) : (
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Globe size={40} color={colors.textSecondary} />
                  <Text style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 8,
                    textAlign: 'center',
                  }}>
                    Enter website to see logo
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleContinue}
              disabled={isDisabled}
              activeOpacity={0.7}
              style={[
                styles.button,
                {
                  backgroundColor: isDisabled ? colors.textSecondary : colors.primary,
                  opacity: isDisabled ? 0.5 : 1
                }
              ]}
            >
              <Text style={styles.buttonText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}
