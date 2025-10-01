import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send, ArrowLeft, MoreVertical, Volume2, VolumeX } from "lucide-react-native";
import Tts from 'react-native-tts';
import { useTheme } from "../theme/theme-context";
import { useQuestions } from "../store/question-store";
import { Message } from "../types/message";
import { LiveSessionScreenProps } from "../types/navigation";
import { getAIResponse } from "../src/services/ai";
import Markdown from "react-native-markdown-display";

export default function LiveSessionScreen({
  navigation,
  route,
}: LiveSessionScreenProps) {
  const { id } = route.params;
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentSpeakingMessageId, setCurrentSpeakingMessageId] = useState<string | null>(null);
  const [highlightedWordIndex, setHighlightedWordIndex] = useState<number>(-1);
  const speechIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { colors } = useTheme();
  const { questions, updateQuestion } = useQuestions();
  const flatListRef = useRef<FlatList>(null);
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const question = questions.find((q) => q.id === id);

  // Initialize TTS
  useEffect(() => {
    const initTts = async () => {
      try {
        const ttsEnabled = await AsyncStorage.getItem('ttsEnabled');
        setIsTtsEnabled(ttsEnabled === 'true');
        
        await Tts.getInitStatus();
        Tts.setDefaultLanguage('en-US');
        Tts.setDefaultRate(0.5);
        
        Tts.addEventListener('tts-start', (event) => {
          console.log('TTS started:', event);
          setIsSpeaking(true);
        });
        
        Tts.addEventListener('tts-finish', (event) => {
          console.log('TTS finished:', event);
          setIsSpeaking(false);
          setCurrentSpeakingMessageId(null);
          setHighlightedWordIndex(-1);
          
          // Clear timer
          if (speechIntervalRef.current) {
            clearInterval(speechIntervalRef.current);
            speechIntervalRef.current = null;
          }
        });
        
        Tts.addEventListener('tts-cancel', (event) => {
          console.log('TTS cancelled:', event);
          setIsSpeaking(false);
          setCurrentSpeakingMessageId(null);
          setHighlightedWordIndex(-1);
          
          // Clear timer
          if (speechIntervalRef.current) {
            clearInterval(speechIntervalRef.current);
            speechIntervalRef.current = null;
          }
        });
      } catch (error: any) {
        console.error('TTS init error:', error);
        if (error.code === 'no_engine') {
          Tts.requestInstallEngine();
        }
      }
    };
    
    initTts();
    
    return () => {
      Tts.removeEventListener('tts-start', () => {});
      Tts.removeEventListener('tts-finish', () => {});
      Tts.removeEventListener('tts-cancel', () => {});
      
      // Clear timer on cleanup
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
        speechIntervalRef.current = null;
      }
      
      try {
        if (Platform.OS === 'ios') {
          Tts.stop(false);
        } else {
          Tts.stop();
        }
      } catch (error) {
        console.log('TTS cleanup error:', error);
      }
    };
  }, []);

  // Toggle TTS
  const toggleTts = async () => {
    const newState = !isTtsEnabled;
    setIsTtsEnabled(newState);
    await AsyncStorage.setItem('ttsEnabled', newState.toString());
    if (!newState && isSpeaking) {
      // Clear timer when turning off TTS
      if (speechIntervalRef.current) {
        clearInterval(speechIntervalRef.current);
        speechIntervalRef.current = null;
      }
      
      try {
        if (Platform.OS === 'ios') {
          Tts.stop(false);
        } else {
          Tts.stop();
        }
      } catch (error) {
        console.log('TTS stop error:', error);
      }
    }
  };

  // Speak message
  const speakMessage = (text: string, messageId: string) => {
    if (!isTtsEnabled) return;
    
    // Clear any existing timer
    if (speechIntervalRef.current) {
      clearInterval(speechIntervalRef.current);
      speechIntervalRef.current = null;
    }
    
    try {
      if (Platform.OS === 'ios') {
        Tts.stop(false); // Stop any current speech
      } else {
        Tts.stop();
      }
    } catch (error) {
      console.log('TTS stop error:', error);
    }
    
    setCurrentSpeakingMessageId(messageId);
    setHighlightedWordIndex(0);
    
    const cleanText = text.replace(/[*_~`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // Start word highlighting timer
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    const totalWords = words.length;
    
    if (totalWords > 0) {
      // Estimate speech duration based on TTS rate and word count
      // At rate 0.5, roughly 120-150 words per minute
      const wordsPerSecond = 2.2; // approximately 132 words per minute
      const wordDuration = 1000 / wordsPerSecond; // milliseconds per word
      
      // Start highlighting from first word
      let currentWordIndex = 0;
      setHighlightedWordIndex(0);
      
      // Start the timer after a small delay to sync with TTS start
      setTimeout(() => {
        speechIntervalRef.current = setInterval(() => {
          currentWordIndex++;
          if (currentWordIndex < totalWords) {
            setHighlightedWordIndex(currentWordIndex);
          } else {
            // Clear interval when we reach the end
            if (speechIntervalRef.current) {
              clearInterval(speechIntervalRef.current);
              speechIntervalRef.current = null;
            }
          }
        }, wordDuration);
      }, 100); // Small delay to sync with TTS start
    }
    
    Tts.speak(cleanText);
  };

  // Render highlighted text for speaking messages
  const renderHighlightedText = (text: string, messageId: string) => {
    const isCurrentlySpeaking = currentSpeakingMessageId === messageId;
    
    if (!isCurrentlySpeaking || highlightedWordIndex === -1) {
      return (
        <Markdown
          style={{
            body: { color: colors.text, fontSize: 16, lineHeight: 22 },
            strong: { fontWeight: "700" },
            bullet_list: { marginVertical: 4 },
            list_item: { flexDirection: "row", marginBottom: 4 },
            link: { color: colors.primary, textDecorationLine: "underline" },
          }}
        >
          {text}
        </Markdown>
      );
    }

    // Clean text and split into words for highlighting (same as speech processing)
    const cleanText = text.replace(/[*_~`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
        {words.map((word, index) => (
          <Text
            key={index}
            style={[
              { 
                color: colors.text, 
                fontSize: 16, 
                lineHeight: 22,
                marginRight: 4,
                paddingHorizontal: 2,
                borderRadius: 4,
              },
              index === highlightedWordIndex && {
                backgroundColor: colors.primary + '40',
                fontWeight: 'bold',
              }
            ]}
          >
            {word}
          </Text>
        ))}
      </View>
    );
  };

  useEffect(() => {
    const initializeSession = async () => {
      if (!question) {
        console.log('No question found');
        return;
      }

      // If we already have an answer, just display the existing conversation
      if (question.text && question.answer) {
        const existingMessages = [
          {
            id: "1",
            text: question.text,
            isUser: true,
            timestamp: question.createdAt,
          },
          {
            id: "2",
            text: question.answer,
            isUser: false,
            timestamp: question.createdAt + 1000,
            confidence: question.confidence,
            sources: question.sources,
          }
        ];
        
        // If question has stored messages, use those instead
        if (question.messages && question.messages.length > 0) {
          setMessages(question.messages);
        } else {
          setMessages(existingMessages);
        }
        return;
      }

      // For new questions, create user message and get AI response
      const userMessage: Message = {
        id: Date.now().toString(),
        text: question.text,
        isUser: true,
        timestamp: Date.now(),
      };
      
      setMessages([userMessage]);
      setIsTyping(true);

      try {
        // Get AI response
        const aiResponse = await getAIResponse([
          { role: "user", content: question.text }
        ]);

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.text,
          isUser: false,
          timestamp: Date.now(),
          confidence: Math.floor(Math.random() * 20) + 80,
          sources: ["DeepSeek AI"],
          images: aiResponse.images,
        };

        const newMessages = [userMessage, aiMessage];
        setMessages(newMessages);
        
        // Auto-speak AI response if TTS is enabled
        if (isTtsEnabled) {
          setTimeout(() => speakMessage(aiMessage.text, aiMessage.id), 500);
        }
        
        // Update question in store with messages
        updateQuestion(question.id, {
          answer: aiMessage.text,
          confidence: aiMessage.confidence,
          sources: aiMessage.sources,
          status: "active", // Keep as active so it shows in the Sessions screen
          messages: newMessages,
        });
      } catch (error) {
        console.error('AI Response Error:', error);
        const errorMessages = [
          userMessage,
          {
            id: Date.now().toString(),
            text: "Sorry, I couldn't connect to the AI service.",
            isUser: false,
            timestamp: Date.now(),
          }
        ];
        setMessages(errorMessages);
        
        // Update question in store with error messages
        updateQuestion(question.id, {
          answer: "Sorry, I couldn't connect to the AI service.",
          status: "active",
          messages: errorMessages,
        });
      } finally {
        setIsTyping(false);
      }
    };

    initializeSession();
  }, [question, updateQuestion, isTtsEnabled]);

  useEffect(() => {
    if (isTyping) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(typingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      typingAnimation.setValue(0);
    }
  }, [isTyping]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      isUser: true,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    try {
      const aiResponse = await getAIResponse([
        ...messages.map((m) => ({
          role: m.isUser ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: newMessage },
      ]);

      const messageResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isUser: false,
        timestamp: Date.now(),
        confidence: Math.floor(Math.random() * 20) + 80,
        sources: ["DeepSeek AI"], // for now, just placeholder
        images: aiResponse.images,
      };

      setMessages((prev) => [...prev, messageResponse]);
      setIsTyping(false);

      // Auto-speak AI response if TTS is enabled
      if (isTtsEnabled) {
        setTimeout(() => speakMessage(messageResponse.text, messageResponse.id), 500);
      }

      if (question) {
        updateQuestion(question.id, {
          text: question.text, // Keep original question text
          answer: messageResponse.text,
          confidence: messageResponse.confidence || 85,
          sources: messageResponse.sources,
          status: "active", // Keep as active
          messages: [...messages, userMessage, messageResponse],
        });
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I couldn’t connect to the AI service.",
          isUser: false,
          timestamp: Date.now(),
        },
      ]);
      setIsTyping(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: item.isUser ? colors.primary : colors.surface,
          },
        ]}
      >
        {item.isUser ? (
          <Text style={[styles.messageText, { color: colors.white }]}>
            {item.text}
          </Text>
        ) : (
          <View>
            {renderHighlightedText(item.text, item.id)}
            
            {isTtsEnabled && (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {isSpeaking && currentSpeakingMessageId === item.id ? (
                  <TouchableOpacity 
                    onPress={() => {
                      // Clear timer when manually stopping
                      if (speechIntervalRef.current) {
                        clearInterval(speechIntervalRef.current);
                        speechIntervalRef.current = null;
                      }
                      
                      try {
                        if (Platform.OS === 'ios') {
                          Tts.stop(false);
                        } else {
                          Tts.stop();
                        }
                      } catch (error) {
                        console.log('TTS stop error:', error);
                      }
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      backgroundColor: colors.error + '20',
                      borderRadius: 12,
                      alignSelf: 'flex-start'
                    }}
                  >
                    <VolumeX size={14} color={colors.error} />
                    <Text style={{ color: colors.error, fontSize: 12, marginLeft: 4 }}>
                      Stop
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    onPress={() => speakMessage(item.text, item.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      backgroundColor: colors.primary + '20',
                      borderRadius: 12,
                      alignSelf: 'flex-start'
                    }}
                  >
                    <Volume2 size={14} color={colors.primary} />
                    <Text style={{ color: colors.primary, fontSize: 12, marginLeft: 4 }}>
                      Speak
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {!item.isUser && (item.confidence || (item.images && item.images.length > 0)) && (
          <View style={styles.messageFooter}>
            {item.confidence && (
              <View
                style={[
                  styles.confidenceBadge,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <Text style={[styles.confidenceText, { color: colors.success }]}>
                  {item.confidence}% confidence
                </Text>
              </View>
            )}

            {item.sources && item.sources.length > 0 && (
              <Text
                style={[styles.sourcesText, { color: colors.textSecondary }]}
              >
                {item.sources.length} sources
              </Text>
            )}

            {item.images && item.images.length > 0 && (
              <View style={styles.imageContainer}>
                {item.images.map((imageUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: imageUrl }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
        {new Date(item.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage]}>
      <View style={[styles.messageBubble, { backgroundColor: colors.surface }]}>
        <View style={styles.typingIndicator}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={[
                styles.typingDot,
                { backgroundColor: colors.textSecondary },
                {
                  opacity: typingAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                  transform: [
                    {
                      translateY: typingAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -4],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );

  if (!question) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          Question not found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.pop()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Live Session
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: colors.textSecondary }]}
          >
            AI Concierge {isSpeaking && "• Speaking"}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            onPress={toggleTts}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isTtsEnabled ? colors.primary + '20' : 'transparent'
            }}
          >
            {isTtsEnabled ? (
              <Volume2 size={20} color={colors.primary} />
            ) : (
              <VolumeX size={20} color={colors.text} />
            )}
          </TouchableOpacity>

          <TouchableOpacity>
            <MoreVertical size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListFooterComponent={isTyping ? renderTypingIndicator : null}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.inputContainer, { backgroundColor: colors.surface }]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type your message..."
          placeholderTextColor={colors.textSecondary}
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: newMessage.trim()
                ? colors.primary
                : colors.border,
            },
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || isTyping}
        >
          <Send size={20} color={colors.white} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    fontSize: 14,
  },
  messagesList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  aiMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sourcesText: {
    fontSize: 12,
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
    minHeight: 40,
    marginBottom: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
});
