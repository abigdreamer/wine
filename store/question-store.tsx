import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { Question } from "../types/question";
import { useAuth } from "./auth-store";

interface QuestionsState {
  questions: Question[];
  addQuestion: (text: string) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  toggleFavorite: (id: string) => void;
  clearAllQuestions: () => void;
}

export const [QuestionsProvider, useQuestions] = createContextHook<QuestionsState>(() => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const { user } = useAuth();

  // Get the storage key based on user ID
  const getStorageKey = () => {
    if (user?.id) {
      return `questions_${user.id}`;
    }
    return "questions_guest"; // Fallback for when user is not logged in
  };

  useEffect(() => {
    if (user) { // Only load questions when user is logged in
      console.log('QuestionStore: User detected, loading questions for user ID:', user.id);
      loadStoredQuestions();
    } else {
      console.log('QuestionStore: No user detected, loading guest questions');
      loadStoredQuestions(); // Still load guest questions if no user
    }
  }, [user?.id]); // Reload questions when user ID changes

  const loadStoredQuestions = async () => {
    try {
      const storageKey = getStorageKey();
      console.log('QuestionStore: Loading questions with storage key:', storageKey);
      
      const storedQuestions = await AsyncStorage.getItem(storageKey);
      if (storedQuestions) {
        const parsed = JSON.parse(storedQuestions);
        console.log('QuestionStore: Loaded', parsed.length, 'questions from storage');
        setQuestions(parsed);
      } else {
        console.log('QuestionStore: No questions found in storage, initializing empty array');
        setQuestions([]); // Clear questions if none found for this user
      }
    } catch (error) {
      console.error("Error loading stored questions:", error);
      setQuestions([]); // Ensure we have an empty array instead of undefined
    }
  };

  const saveQuestions = async (newQuestions: Question[]) => {
    try {
      const storageKey = getStorageKey();
      await AsyncStorage.setItem(storageKey, JSON.stringify(newQuestions));
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  const addQuestion = (text: string): Question => {
    console.log('QuestionStore: Adding new question:', text);
    const newQuestion: Question = {
      id: Date.now().toString(),
      text,
      status: "active",
      createdAt: Date.now(),
      confidence: 0,
      domain: "General",
      isFavorite: false,
      sources: [],
    };

    console.log('QuestionStore: Created question object:', newQuestion);
    console.log('QuestionStore: Current questions count:', questions.length);
    const updatedQuestions = [newQuestion, ...questions];
    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
    
    return newQuestion;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const updatedQuestions = questions.map(q =>
      q.id === id ? { ...q, ...updates } : q
    );
    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
  };

  const toggleFavorite = (id: string) => {
    const updatedQuestions = questions.map(q =>
      q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
    );
    setQuestions(updatedQuestions);
    saveQuestions(updatedQuestions);
  };

  const clearAllQuestions = async () => {
    try {
      const storageKey = getStorageKey();
      await AsyncStorage.removeItem(storageKey);
      setQuestions([]);
    } catch (error) {
      console.error("Error clearing questions:", error);
    }
  };

  return {
    questions,
    addQuestion,
    updateQuestion,
    toggleFavorite,
    clearAllQuestions,
  };
});