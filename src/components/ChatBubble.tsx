import React from "react";
import { View, StyleSheet } from "react-native";
import {
    Surface,
    Text,
    useTheme,
    IconButton,
    Divider,
} from "react-native-paper";
import * as Clipboard from "expo-clipboard";
import { Message } from "../types/chat";

interface Props {
    message: Message;
}

const ChatBubble = ({ message }: Props) => {
    const theme = useTheme();
    const isUser = message.role === "user";

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(message.content);
    };

    // USER MESSAGE LAYOUT (Bubble)
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

    // AI MESSAGE LAYOUT (Plain Text + Divider)
    return (
        <View style={styles.aiContainer}>
            <View style={styles.aiContentRow}>
                <Text
                    style={[
                        styles.text,
                        { color: theme.colors.onSurface, flex: 1 },
                    ]}
                    selectable
                >
                    {message.content}
                </Text>
                <IconButton
                    icon="content-copy"
                    size={16}
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={copyToClipboard}
                    style={styles.copyBtn}
                />
            </View>
            <Divider
                style={[
                    styles.divider,
                    { backgroundColor: theme.colors.secondary },
                ]}
            />
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
    },
    bubble: {
        borderRadius: 16,
        borderBottomRightRadius: 2,
        padding: 12,
        maxWidth: "85%",
    },
    aiContainer: {
        marginBottom: 24,
        width: "100%",
    },
    aiContentRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 4,
    },
    text: {
        fontSize: 15,
        lineHeight: 24,
        fontFamily: "JetBrainsMono",
    },
    copyBtn: {
        margin: 0,
        marginTop: -4,
    },
    divider: {
        marginTop: 6,
        height: 1,
        opacity: 0.4,
    },
});

export default ChatBubble;
