import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { Question } from "../types/question";

interface QuestionsState {
  questions: Question[];
  addQuestion: (text: string) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  toggleFavorite: (id: string) => void;
}

export const [QuestionsProvider, useQuestions] = createContextHook<QuestionsState>(() => {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    loadStoredQuestions();
  }, []);

  const loadStoredQuestions = async () => {
    try {
      const storedQuestions = await AsyncStorage.getItem("questions");
      if (storedQuestions) {
        setQuestions(JSON.parse(storedQuestions));
      }
    } catch (error) {
      console.error("Error loading stored questions:", error);
    }
  };

  const saveQuestions = async (newQuestions: Question[]) => {
    try {
      await AsyncStorage.setItem("questions", JSON.stringify(newQuestions));
    } catch (error) {
      console.error("Error saving questions:", error);
    }
  };

  const addQuestion = (text: string): Question => {
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

  return {
    questions,
    addQuestion,
    updateQuestion,
    toggleFavorite,
  };
});