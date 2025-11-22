import React, { useState, useRef, useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import {
    StyleSheet,
    View,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    Appbar,
    IconButton,
    useTheme,
    Surface,
    ProgressBar,
    Text,
    Icon,
    ActivityIndicator,
} from "react-native-paper";
import { useLlama } from "../context/LlamaContext";
import ModelSelectorBanner from "../components/ModelSelectorBanner";
import ChatBubble from "../components/ChatBubble";
import { Message } from "../types/chat";
import { getModelNameById } from "../data/models";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
    saveChatSession,
    saveMessages,
    getMessages,
    ChatSession,
} from "../utils/storage";

const STOP_WORDS = [
    "</s>",
    "<|end|>",
    "<|eot_id|>",
    "<|end_of_text|>",
    "<|im_end|>",
    "<|EOT|>",
    "<|END_OF_TURN_TOKEN|>",
    "<|end_of_turn|>",
    "<|endoftext|>",
    "User:",
    "Assistant:",
];

const ChatScreen = ({ navigation, route }: any) => {
    const theme = useTheme();
    const [text, setText] = useState("");
    const [isSheetVisible, setIsSheetVisible] = useState(false);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentResponse, setCurrentResponse] = useState("");
    const [conversationTitle, setConversationTitle] = useState<string>("");
    const responseRef = useRef("");
    const [sessionId, setSessionId] = useState<string | null>(null);

    const {
        activeModelId,
        isModelLoading,
        loadingProgress,
        isModelLoaded,
        llama,
    } = useLlama();

    useEffect(() => {
        NavigationBar.setBackgroundColorAsync(theme.colors.surfaceVariant);

        return () => {
            deactivateKeepAwake("chat-generation");
        };
    }, [theme]);

    // LOAD CHAT IF NAVIGATED FROM HISTORY
    useEffect(() => {
        if (route.params?.chatId) {
            const id = route.params.chatId;
            const loadedMessages = getMessages(id);
            const loadedTitle = route.params.title || "";

            setSessionId(id);
            setMessages(loadedMessages);
            setConversationTitle(loadedTitle);

            navigation.setParams({ chatId: undefined, title: undefined });
        }
    }, [route.params]);

    // HANDLE NEW CHAT RESET
    useEffect(() => {
        if (route.params?.startNewChat) {
            setMessages([]);
            setConversationTitle("");
            setText("");
            setSessionId(null);
            navigation.setParams({ startNewChat: undefined });
        }
    }, [route.params]);

    // AUTO-SAVE LOGIC
    useEffect(() => {
        if (messages.length === 0) return;

        const currentId = sessionId || Date.now().toString();

        if (!sessionId) {
            setSessionId(currentId);
        }

        const lastMsg = messages[messages.length - 1];
        const preview =
            lastMsg.role === "user"
                ? `You: ${lastMsg.content}`
                : lastMsg.content;

        const session: ChatSession = {
            id: currentId,
            title: conversationTitle || "New Conversation",
            subtitle: preview.substring(0, 100),
            date: new Date().toLocaleDateString(),
            lastModified: Date.now(),
            modelId: activeModelId || undefined,
        };

        // Persist to MMKV
        saveChatSession(session);
        saveMessages(currentId, messages);
    }, [messages, conversationTitle]);

    // --- AI TITLE GENERATOR ---
    const generateConversationTitle = async (userMessage: string) => {
        if (!llama) return;
        try {
            const contextText =
                userMessage.length > 300
                    ? userMessage.substring(0, 300) + "..."
                    : userMessage;

            const prompt = `\n\nSystem: Generate a very short title (maximum 5 words) for this input: "${contextText}". Do not use quotes.\nTitle:`;

            const result = await llama.completion({
                prompt: prompt,
                n_predict: 12,
                stop: ["\n", ...STOP_WORDS],
            });

            const cleanTitle = result.text
                .trim()
                .replace(/^"|"$/g, "")
                .replace(/\.$/, "");
            if (cleanTitle) {
                setConversationTitle(cleanTitle);
            }
        } catch (e) {
            console.log("Failed to generate title", e);
        }
    };

    // --- CHAT LOGIC ---
    const handleSend = async () => {
        if (!text.trim() || !llama || isGenerating) return;

        const userText = text.trim();
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userText,
        };

        const isFirstMessage = messages.length === 0;

        setMessages((prev) => [...prev, userMessage]);
        setText("");
        setIsGenerating(true);
        setCurrentResponse("");
        responseRef.current = "";

        await activateKeepAwakeAsync("chat-generation");

        try {
            await llama.completion(
                {
                    messages: [
                        {
                            role: "system",
                            content:
                                "You are Soliloquy, a helpful and private AI assistant running locally on the user's device.",
                        },
                        ...[...messages, userMessage].map((m) => ({
                            role: m.role,
                            content: m.content,
                        })),
                    ],
                    n_predict: 400,
                    stop: STOP_WORDS,
                    temperature: 0.7,
                },
                (data: { token: string }) => {
                    responseRef.current += data.token;
                    setCurrentResponse((prev) => prev + data.token);
                }
            );

            if (responseRef.current.length > 0) {
                const assistantMsg: Message = {
                    id: Date.now().toString(),
                    role: "assistant",
                    content: responseRef.current,
                };

                setMessages((prev) => [...prev, assistantMsg]);
                setCurrentResponse("");
                setIsGenerating(false);

                if (!conversationTitle && userText.length > 12) {
                    generateConversationTitle(userText);
                }
            } else {
                setIsGenerating(false);
            }
        } catch (e) {
            console.error("Generation Error:", e);
            setCurrentResponse(
                (prev) => prev + "\n[Error generating response]"
            );
            setIsGenerating(false);
        } finally {
            await deactivateKeepAwake("chat-generation");
        }
    };

    // --- TITLE HELPERS ---
    const mainTitle = conversationTitle || "Soliloquy";

    const subTitle = isModelLoading
        ? "Loading Brain..."
        : activeModelId
        ? getModelNameById(activeModelId)
        : "Select Model";

    const reversedMessages = [...messages].reverse();

    const renderStreamingBubble = () => {
        if (!currentResponse) return null;

        const streamingMessage: Message = {
            id: "streaming-temp",
            role: "assistant",
            content: currentResponse,
        };
        return <ChatBubble message={streamingMessage} isStreaming={true} />;
    };

    return (
        <SafeAreaView
            style={[
                styles.safeArea,
                { backgroundColor: theme.colors.background },
            ]}
            edges={["left", "right", "bottom"]}
        >
            {/* Top Header */}
            <Appbar.Header
                style={{
                    backgroundColor: theme.colors.background,
                    elevation: 8,
                    height: 64,
                }}
                mode="center-aligned"
                elevated
            >
                <Appbar.Action
                    icon="history"
                    onPress={() => navigation.navigate("History")}
                />

                <View style={styles.titleContainer}>
                    <TouchableOpacity
                        onPress={() => setIsSheetVisible(!isSheetVisible)}
                        style={styles.titleButton}
                        disabled={isModelLoading}
                    >
                        <View style={styles.titleTextColumn}>
                            {/* Main Title */}
                            <Text
                                style={[
                                    styles.headerTitle,
                                    { color: theme.colors.onSurface },
                                ]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {mainTitle}
                            </Text>
                            <Text
                                style={[
                                    styles.headerSubtitle,
                                    { color: theme.colors.primary },
                                ]}
                                numberOfLines={1}
                            >
                                {subTitle}
                            </Text>
                        </View>

                        {/* Chevron */}
                        <Icon
                            source={
                                isSheetVisible ? "chevron-up" : "chevron-down"
                            }
                            size={18}
                            color={theme.colors.onSurfaceVariant}
                        />
                    </TouchableOpacity>
                </View>

                <Appbar.Action
                    icon="cog"
                    onPress={() => navigation.navigate("Settings")}
                />
            </Appbar.Header>

            {/* MODEL LOADING BAR */}
            {isModelLoading && (
                <ProgressBar
                    indeterminate={loadingProgress === 0}
                    progress={loadingProgress}
                    color={theme.colors.primary}
                    style={{ height: 2 }}
                />
            )}

            <ModelSelectorBanner
                visible={isSheetVisible}
                onDismiss={() => setIsSheetVisible(false)}
                onManageModels={() => {
                    setIsSheetVisible(false);
                    navigation.navigate("Models");
                }}
            />

            {/* Main Chat Area */}
            <View
                style={[
                    styles.chatContainer,
                    { backgroundColor: theme.colors.surfaceVariant },
                ]}
            >
                {/* RENDER CHAT LIST */}
                {messages.length > 0 && (
                    <FlatList
                        data={reversedMessages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <ChatBubble message={item} />}
                        inverted={true}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={
                            isGenerating ? renderStreamingBubble() : null
                        }
                        removeClippedSubviews={false}
                        style={
                            !isModelLoaded && !isModelLoading
                                ? { opacity: 0.2 }
                                : undefined
                        }
                    />
                )}

                {/* RENDER PLACEHOLDER / OVERLAY */}
                {!isModelLoaded && !isModelLoading && (
                    <View
                        style={[
                            styles.placeholderContainer,
                            messages.length > 0
                                ? StyleSheet.absoluteFill
                                : { flex: 1 },
                        ]}
                    >
                        <Surface
                            style={[
                                styles.overlayCard,
                                {
                                    backgroundColor: theme.colors.background,
                                    borderRadius: theme.roundness * 6,
                                },
                            ]}
                            elevation={1}
                        >
                            <Icon
                                source="robot-dead-outline"
                                size={48}
                                color={theme.colors.error}
                            />
                            <Text
                                style={{
                                    color: theme.colors.onSurface,
                                    marginTop: 16,
                                    marginBottom: 8,
                                    fontFamily: "JetBrainsMono",
                                    fontWeight: "bold",
                                }}
                            >
                                Brain Missing
                            </Text>
                            <Text
                                style={{
                                    color: theme.colors.onSurfaceVariant,
                                    fontSize: 12,
                                    marginBottom: 16,
                                }}
                            >
                                Load a model to continue.
                            </Text>

                            <TouchableOpacity
                                onPress={() => setIsSheetVisible(true)}
                            >
                                <Text
                                    style={{
                                        color: theme.colors.primary,
                                        fontWeight: "bold",
                                    }}
                                >
                                    SELECT MODEL
                                </Text>
                            </TouchableOpacity>
                        </Surface>
                    </View>
                )}
            </View>

            {/* Bottom Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View
                    style={[
                        styles.inputWrapper,
                        { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                >
                    <Surface
                        style={[
                            styles.inputContainer,
                            {
                                backgroundColor: theme.colors.background,
                                borderRadius: theme.roundness * 6,
                            },
                        ]}
                        elevation={1}
                    >
                        <TextInput
                            placeholder={
                                isModelLoaded
                                    ? "Ask anything..."
                                    : "Load a model first..."
                            }
                            placeholderTextColor="#888"
                            value={text}
                            onChangeText={setText}
                            cursorColor={theme.colors.primary}
                            multiline
                            numberOfLines={6}
                            editable={isModelLoaded}
                            style={[
                                styles.textInput,
                                {
                                    color: theme.colors.onSurface,
                                    fontFamily: "JetBrainsMono",
                                },
                            ]}
                        />

                        {isGenerating ? (
                            <View style={styles.sendButton}>
                                <ActivityIndicator
                                    size={20}
                                    color={theme.colors.primary}
                                />
                            </View>
                        ) : (
                            <IconButton
                                icon="send"
                                size={24}
                                iconColor={
                                    isModelLoaded
                                        ? theme.colors.primary
                                        : theme.colors.onSurfaceDisabled
                                }
                                disabled={!isModelLoaded || isGenerating}
                                onPress={handleSend}
                                style={styles.sendButton}
                            />
                        )}
                    </Surface>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    titleContainer: {
        flex: 1,
        alignItems: "center",
    },
    titleTextColumn: {
        alignItems: "center",
        justifyContent: "center",
        maxWidth: "50%",
    },
    headerTitle: {
        fontFamily: "JetBrainsMono",
        fontWeight: "bold",
        fontSize: 16,
    },
    headerSubtitle: {
        fontFamily: "JetBrainsMono",
        fontSize: 12,
        opacity: 0.8,
    },
    chatContainer: {
        flex: 1,
    },
    listContent: {
        padding: 16,
        paddingBottom: 8,
        flexGrow: 1,
        justifyContent: "flex-end",
    },
    titleButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    overlayCard: {
        padding: 24,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 200,
    },
    inputWrapper: {
        paddingHorizontal: 8,
        paddingTop: 2,
        paddingBottom: 12,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    textInput: {
        flex: 1,
        fontFamily: "JetBrainsMono",
        fontWeight: "400",
        backgroundColor: "transparent",
        minHeight: 56,
        height: "auto",
        fontSize: 16,
        lineHeight: 22,
        marginLeft: 2,
    },
    sendButton: {
        margin: 0,
    },
});

export default ChatScreen;
