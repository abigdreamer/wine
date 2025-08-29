import React, { useState } from "react";
import {
  Platform,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme-context";
import { MainRoutes, UserInfoScreenProps } from "../types/navigation";
import { User, Globe, ChevronLeft } from "lucide-react-native";
import { saveConfig } from "../store/config-storage";

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
  const [website, setWebsite] = useState("https://www.domainecarneros.com");
  const { colors } = useTheme();

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
                  editable={false}
                  placeholder='Enter your website'
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
              }}>
              <Image
                source={require('../assets/images/logo.png')}
                style={{
                  width: 300,
                  height: 100,
                }}
              />
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
