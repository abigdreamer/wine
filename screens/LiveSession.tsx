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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Send, ArrowLeft, MoreVertical } from "lucide-react-native";
import { useTheme } from "../theme/theme-context";
import { useQuestions } from "../store/question-store";
import { Message } from "../types/message";
import { LiveSessionScreenProps } from "../types/navigation";

export default function LiveSessionScreen({ navigation, route }: LiveSessionScreenProps) {
    
    const { id } = route.params;
    const [newMessage, setNewMessage] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const { colors } = useTheme();
    const { questions, updateQuestion } = useQuestions();
    const flatListRef = useRef<FlatList>(null);
    const typingAnimation = useRef(new Animated.Value(0)).current;

    const question = questions.find(q => q.id === id);

    useEffect(() => {
        if (question) {
            const initialMessages: Message[] = [
                {
                    id: "1",
                    text: question.text,
                    isUser: true,
                    timestamp: question.createdAt,
                }
            ];

            if (question.answer) {
                initialMessages.push({
                    id: "2",
                    text: question.answer,
                    isUser: false,
                    timestamp: question.createdAt + 1000,
                    confidence: question.confidence,
                    sources: question.sources,
                });
            }

            setMessages(initialMessages);
        }
    }, [question]);

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

        setMessages(prev => [...prev, userMessage]);
        setNewMessage("");
        setIsTyping(true);

        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: "This is a simulated AI response. In a real implementation, this would connect to your AI service via WebSocket for real-time streaming responses.",
                isUser: false,
                timestamp: Date.now(),
                confidence: Math.floor(Math.random() * 20) + 80,
                sources: ["Source 1", "Source 2"],
            };

            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);

            if (question) {
                updateQuestion(question.id, {
                    answer: aiResponse.text,
                    confidence: aiResponse.confidence || 85,
                    status: "completed",
                });
            }
        }, 2000);
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View style={[
            styles.messageContainer,
            item.isUser ? styles.userMessage : styles.aiMessage
        ]}>
            <View style={[
                styles.messageBubble,
                {
                    backgroundColor: item.isUser ? colors.primary : colors.surface,
                }
            ]}>
                <Text style={[
                    styles.messageText,
                    { color: item.isUser ? colors.white : colors.text }
                ]}>
                    {item.text}
                </Text>

                {!item.isUser && item.confidence && (
                    <View style={styles.messageFooter}>
                        <View style={[styles.confidenceBadge, { backgroundColor: colors.success + "20" }]}>
                            <Text style={[styles.confidenceText, { color: colors.success }]}>
                                {item.confidence}% confidence
                            </Text>
                        </View>

                        {item.sources && item.sources.length > 0 && (
                            <Text style={[styles.sourcesText, { color: colors.textSecondary }]}>
                                {item.sources.length} sources
                            </Text>
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
                                    transform: [{
                                        translateY: typingAnimation.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, -4],
                                        }),
                                    }],
                                }
                            ]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );

    if (!question) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={[styles.errorText, { color: colors.text }]}>
                    Question not found
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <TouchableOpacity onPress={() => navigation.pop()}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.headerContent}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Live Session
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        AI Concierge
                    </Text>
                </View>

                <TouchableOpacity>
                    <MoreVertical size={24} color={colors.text} />
                </TouchableOpacity>
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
                        { backgroundColor: newMessage.trim() ? colors.primary : colors.border }
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
        alignItems: "flex-end",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.1)",
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 12,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 18,
        textAlign: "center",
        marginTop: 50,
    },
});