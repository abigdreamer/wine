import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Clock, Star, Filter } from "lucide-react-native";
import { useTheme } from "../store/theme-store";
import { useQuestions } from "../store/question-store";
import { Question } from "../types/question";
import { HistoryScreenProps, MainRoutes } from "../types/navigation";

export default function HistoryScreen({ navigation }: HistoryScreenProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { colors } = useTheme();
  const { questions, toggleFavorite } = useQuestions();

  const completedQuestions = questions.filter(q => q.status === "completed");

  const filteredQuestions = completedQuestions.filter(q =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderQuestion = ({ item }: { item: Question }) => (
    <TouchableOpacity
      style={[styles.questionCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.push(MainRoutes.LiveSession, { id: item.id })}
    >
      <View style={styles.questionHeader}>
        <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        
        <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
          <Star
            size={20}
            color={item.isFavorite ? colors.warning : colors.textSecondary}
            fill={item.isFavorite ? colors.warning : "none"}
          />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.questionText, { color: colors.text }]} numberOfLines={3}>
        {item.text}
      </Text>
      
      {item.answer && (
        <Text style={[styles.answerPreview, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.answer}
        </Text>
      )}
      
      <View style={styles.questionFooter}>
        <View style={[styles.confidenceBadge, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.confidenceText, { color: colors.primary }]}>
            {item.confidence}% confidence
          </Text>
        </View>
        
        <Text style={[styles.domain, { color: colors.textSecondary }]}>
          {item.domain}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          History
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {completedQuestions.length} past conversations
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search questions..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.surface }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {filteredQuestions.length === 0 ? (
        <View style={styles.emptyState}>
          <Clock size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {searchQuery ? "No Results Found" : "No History Yet"}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {searchQuery 
              ? "Try adjusting your search terms"
              : "Your completed conversations will appear here"
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredQuestions}
          renderItem={renderQuestion}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.questionsList}
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
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  questionsList: {
    paddingHorizontal: 24,
  },
  questionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: "500",
  },
  questionText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
    fontWeight: "500",
  },
  answerPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  questionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  domain: {
    fontSize: 12,
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
  },
});