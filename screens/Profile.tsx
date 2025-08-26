import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Settings,
  Bell,
  Moon,
  Sun,
  BarChart3,
  CreditCard,
  LogOut,
  ChevronRight,
} from "lucide-react-native";
import { useAuth } from "../store/auth-store";
import { useTheme } from "../theme/theme-context";
import { useQuestions } from "../store/question-store";
import { MainRoutes, ProfileScreenProps } from "../types/navigation";

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { questions } = useQuestions();

  const stats = {
    totalQuestions: questions.length,
    avgConfidence: Math.round(
      questions.reduce((sum, q) => sum + q.confidence, 0) / questions.length || 0
    ),
    favoritesCount: questions.filter(q => q.isFavorite).length,
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace(MainRoutes.Onboarding)
  };

  const menuItems = [
    {
      icon: BarChart3,
      title: "Usage Statistics",
      subtitle: "View your activity",
      onPress: () => {},
    },
    {
      icon: CreditCard,
      title: "Subscription",
      subtitle: "Manage your plan",
      onPress: () => {},
    },
    {
      icon: Bell,
      title: "Notifications",
      subtitle: "Configure alerts",
      onPress: () => {},
    },
    {
      icon: Settings,
      title: "Settings",
      subtitle: "App preferences",
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <User size={32} color={colors.white} />
          </View>
          
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.email || "User"}
          </Text>
          
          <Text style={[styles.email, { color: colors.textSecondary }]}>
            Premium Member
          </Text>
        </View>

        <View style={[styles.statsContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.totalQuestions}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Questions Asked
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {stats.avgConfidence}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Avg Confidence
            </Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {stats.favoritesCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Favorites
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.themeToggle, { backgroundColor: colors.surface }]}>
            <View style={styles.themeToggleContent}>
              {isDark ? (
                <Moon size={24} color={colors.text} />
              ) : (
                <Sun size={24} color={colors.text} />
              )}
              <Text style={[styles.themeToggleText, { color: colors.text }]}>
                {isDark ? "Dark Mode" : "Light Mode"}
              </Text>
            </View>
            
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: colors.surface }]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
                  <item.icon size={20} color={colors.primary} />
                </View>
                
                <View style={styles.menuText}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.error + "20" }]}
            onPress={handleLogout}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
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
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 24,
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  themeToggleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});