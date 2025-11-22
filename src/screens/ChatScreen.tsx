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

const ChatScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const [text, setText] = useState("");
    const [isSheetVisible, setIsSheetVisible] = useState(false);

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentResponse, setCurrentResponse] = useState("");

    const responseRef = useRef("");

    const {
        activeModelId,
        isModelLoading,
        loadingProgress,
        isModelLoaded,
        llama,
    } = useLlama();

    useEffect(() => {
        NavigationBar.setBackgroundColorAsync(theme.colors.surfaceVariant);
    });

    // --- CHAT LOGIC ---
    const handleSend = async () => {
        if (!text.trim() || !llama || isGenerating) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text.trim(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setText("");
        setIsGenerating(true);
        setCurrentResponse("");
        responseRef.current = "";

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
            } else {
                setIsGenerating(false);
            }
        } catch (e) {
            console.error("Generation Error:", e);
            setCurrentResponse(
                (prev) => prev + "\n[Error generating response]"
            );
            setIsGenerating(false);
        }
    };

    // --- UI HELPERS ---
    const getModelName = () => {
        if (isModelLoading) return "Loading...";
        if (!activeModelId) return "Select Model";
        return getModelNameById(activeModelId);
    };

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
                        <Text
                            style={[
                                styles.headerTitle,
                                { color: theme.colors.onSurface },
                            ]}
                        >
                            {getModelName()}
                        </Text>
                        <Icon
                            source={
                                isSheetVisible ? "chevron-up" : "chevron-down"
                            }
                            size={20}
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
                {!isModelLoaded && !isModelLoading ? (
                    <View style={styles.placeholderContainer}>
                        <Icon
                            source="robot-dead-outline"
                            size={64}
                            color={theme.colors.onSurfaceDisabled}
                        />
                        <Text
                            style={{
                                color: theme.colors.onSurfaceDisabled,
                                marginTop: 16,
                                fontFamily: "JetBrainsMono",
                            }}
                        >
                            No model loaded.
                        </Text>
                    </View>
                ) : (
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
                    />
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
    headerTitle: {
        fontFamily: "JetBrainsMono",
        fontWeight: "bold",
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
    titleContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    titleButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        opacity: 0.6,
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
