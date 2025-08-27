import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme-context";
import { MainRoutes, UserInfoScreenProps } from "../types/navigation";
import { User, Globe } from "lucide-react-native";
import { saveConfig } from "../store/config-storage";
import { styles } from "../style/styles";

export default function UserInfo({ navigation }: UserInfoScreenProps) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const { colors } = useTheme();

  const handleContinue = async () => {
    if (!name || !website) {
      Alert.alert("Error", "Please enter both name and website");
      return;
    }

    await saveConfig({ name, website });

    navigation.replace(MainRoutes.BottomTab);
  };

  const isDisabled = !name.trim() || !website.trim();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Almost there!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Please tell us your name and website
          </Text>

          <View style={styles.form}>
            {/* Name Field */}
            <View
              style={[styles.inputContainer, { borderColor: colors.border }]}
            >
              <User size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Your Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Website Field */}
            <View
              style={[styles.inputContainer, { borderColor: colors.border }]}
            >
              <Globe size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Website"
                placeholderTextColor={colors.textSecondary}
                value={website}
                onChangeText={setWebsite}
                autoCapitalize="none"
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: isDisabled ? colors.border : colors.primary,
                },
              ]}
              onPress={handleContinue}
              disabled={isDisabled}
            >
              <Text style={[styles.buttonText, { color: colors.white }]}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
