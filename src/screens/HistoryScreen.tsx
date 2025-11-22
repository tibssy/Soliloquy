// src/screens/HistoryScreen.tsx
import React, { useCallback, useState } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import {
    Appbar,
    List,
    Text,
    useTheme,
    Divider,
    IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getChatSessions, deleteSession, ChatSession } from "../utils/storage";

const HistoryScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const [history, setHistory] = useState<ChatSession[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = () => {
        const sessions = getChatSessions();
        setHistory(sessions);
    };

    const handleOpenChat = (item: ChatSession) => {
        navigation.navigate("Chat", {
            chatId: item.id,
            title: item.title,
        });
    };

    const handleDelete = (id: string) => {
        Alert.alert("Delete Chat", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: () => {
                    deleteSession(id);
                    loadHistory();
                },
            },
        ]);
    };

    const renderItem = ({ item }: { item: ChatSession }) => (
        <List.Item
            title={item.title}
            description={item.subtitle}
            titleStyle={{
                fontFamily: "JetBrainsMono",
                fontWeight: "bold",
                color: theme.colors.onSurface,
            }}
            descriptionStyle={{
                fontFamily: "JetBrainsMono",
                fontSize: 12,
                color: theme.colors.onSurfaceVariant,
                marginTop: 4,
            }}
            descriptionNumberOfLines={2}
            right={() => (
                <View style={styles.rightContainer}>
                    <Text
                        style={[
                            styles.dateText,
                            { color: theme.colors.onSurfaceVariant },
                        ]}
                    >
                        {item.date}
                    </Text>
                    <IconButton
                        icon="trash-can-outline"
                        size={16}
                        onPress={() => handleDelete(item.id)}
                        style={{ margin: 0, marginTop: 4 }}
                    />
                </View>
            )}
            onPress={() => handleOpenChat(item)}
            style={styles.listItem}
        />
    );

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
            edges={["bottom", "left", "right"]}
        >
            <Appbar.Header
                style={{ backgroundColor: theme.colors.background }}
                mode="center-aligned"
            >
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title="History"
                    titleStyle={styles.headerTitle}
                />
                <Appbar.Action
                    icon="plus"
                    onPress={() =>
                        navigation.navigate("Chat", { startNewChat: true })
                    }
                    color={theme.colors.primary}
                />
            </Appbar.Header>

            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => (
                    <Divider style={{ opacity: 0.1 }} />
                )}
                ListEmptyComponent={
                    <Text
                        style={{
                            textAlign: "center",
                            marginTop: 20,
                            color: theme.colors.onSurfaceVariant,
                            fontFamily: "JetBrainsMono",
                        }}
                    >
                        No history found.
                    </Text>
                }
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerTitle: {
        fontWeight: "bold",
        fontFamily: "JetBrainsMono",
    },
    listContent: {
        paddingHorizontal: 8,
    },
    listItem: {
        paddingVertical: 12,
    },
    rightContainer: {
        alignItems: "flex-end",
        justifyContent: "flex-start",
        paddingLeft: 8,
    },
    dateText: {
        fontFamily: "JetBrainsMono",
        fontSize: 10,
        marginBottom: 0,
    },
});

export default HistoryScreen;
