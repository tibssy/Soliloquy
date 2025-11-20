import React, { useState, useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import {
    StyleSheet,
    View,
    KeyboardAvoidingView,
    Platform,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Appbar, IconButton, useTheme, Surface } from "react-native-paper";

const ChatScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const [text, setText] = useState("");

    useEffect(() => {
        NavigationBar.setBackgroundColorAsync(theme.colors.surfaceVariant);
    });

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
                {/* History Icon (Left) */}
                <Appbar.Action
                    icon="history"
                    onPress={() => console.log("History pressed")}
                />

                {/* Title (Center) */}
                <Appbar.Content
                    title="Soliloquy"
                    titleStyle={styles.headerTitle}
                />

                {/* Settings Icon (Right) */}
                <Appbar.Action
                    icon="cog"
                    onPress={() => navigation.navigate("Settings")}
                />
            </Appbar.Header>

            {/* Main Chat Area */}
            <View
                style={[
                    styles.chatContainer,
                    { backgroundColor: theme.colors.surfaceVariant },
                ]}
            ></View>

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
                            placeholder="Ask anything..."
                            placeholderTextColor="#888"
                            value={text}
                            onChangeText={setText}
                            cursorColor={theme.colors.primary}
                            multiline
                            numberOfLines={6}
                            style={[
                                styles.textInput,
                                { color: theme.colors.onSurface },
                            ]}
                        />
                        <IconButton
                            icon="send"
                            size={24}
                            iconColor={theme.colors.primary}
                            onPress={() => {
                                console.log("Send:", text);
                                setText("");
                            }}
                            style={styles.sendButton}
                        />
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
        padding: 16,
    },
    inputWrapper: {
        paddingHorizontal: 8,
        paddingVertical: 12,
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
