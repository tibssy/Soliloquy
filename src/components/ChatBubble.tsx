import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
    Surface,
    Text,
    useTheme,
    IconButton,
    Divider,
} from "react-native-paper";
import * as Clipboard from "expo-clipboard";
import Markdown from "react-native-markdown-display";
import { Message } from "../types/chat";

interface Props {
    message: Message;
    isStreaming?: boolean;
}

const ChatBubble = ({ message, isStreaming = false }: Props) => {
    const theme = useTheme();
    const isUser = message.role === "user";

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(message.content);
    };

    const markdownStyles = useMemo(
        () => ({
            body: {
                color: theme.colors.onSurface,
                fontFamily: "JetBrainsMono",
                fontSize: 15,
                lineHeight: 24,
            },
            paragraph: {
                marginTop: 0,
                marginBottom: 10,
                flexWrap: "wrap",
            },
            code_block: {
                backgroundColor: theme.colors.inverseOnSurface,
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
                fontFamily: "JetBrainsMono",
                marginVertical: 8,
            },
            fence: {
                backgroundColor: theme.colors.inverseOnSurface,
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.colors.outlineVariant,
                fontFamily: "JetBrainsMono",
                marginVertical: 8,
            },
            code_inline: {
                backgroundColor: theme.colors.inverseOnSurface,
                borderRadius: 4,
                paddingHorizontal: 4,
                paddingVertical: 2,
                fontFamily: "JetBrainsMono",
                color: theme.colors.primary,
            },
            link: {
                color: theme.colors.primary,
                textDecorationLine: "underline",
            },
            bullet_list: {
                marginBottom: 8,
            },
            ordered_list: {
                marginBottom: 8,
            },
        }),
        [theme]
    );

    // 1. USER MESSAGE LAYOUT
    if (isUser) {
        return (
            <View style={[styles.row, styles.userRow]}>
                <Surface
                    style={[
                        styles.bubble,
                        { backgroundColor: theme.colors.onSurfaceVariant },
                    ]}
                    elevation={1}
                >
                    <Text
                        style={[styles.text, { color: theme.colors.onPrimary }]}
                        selectable
                    >
                        {message.content}
                    </Text>
                </Surface>
            </View>
        );
    }

    // AI MESSAGE LAYOUT (Markdown + Actions)
    return (
        <View style={styles.aiContainer}>
            <View style={styles.markdownWrapper}>
                <Markdown style={markdownStyles as any}>
                    {message.content}
                    {/* {message.content + (isStreaming ? " |" : "")} */}
                </Markdown>
            </View>

            {/* Action Row */}
            {!isStreaming && (
                <View style={styles.actionRow}>
                    <IconButton
                        icon="content-copy"
                        size={18}
                        iconColor={theme.colors.primary}
                        onPress={copyToClipboard}
                        style={styles.actionBtn}
                    />
                    <IconButton
                        icon="volume-high"
                        size={18}
                        iconColor={theme.colors.primary}
                        onPress={() => console.log("TTS")}
                        style={styles.actionBtn}
                    />
                </View>
            )}

            {/* Divider */}
            {!isStreaming && (
                <Divider
                    style={[
                        styles.divider,
                        { backgroundColor: theme.colors.onSurfaceVariant },
                    ]}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        marginBottom: 16,
        width: "100%",
    },
    userRow: {
        justifyContent: "flex-end",
        paddingVertical: 6,
    },
    bubble: {
        borderRadius: 12,
        borderBottomRightRadius: 2,
        padding: 12,
        maxWidth: "85%",
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        fontFamily: "JetBrainsMono",
    },
    aiContainer: {
        marginBottom: 24,
        width: "100%",
    },
    markdownWrapper: {
        paddingHorizontal: 4,
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        marginTop: 0,
        paddingHorizontal: 0,
    },
    actionBtn: {
        margin: 0,
        marginRight: 8,
    },
    divider: {
        marginTop: 8,
        height: 1,
        opacity: 0.4,
    },
});

export default ChatBubble;
