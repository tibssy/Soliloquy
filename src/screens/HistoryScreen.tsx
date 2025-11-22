import React, { useCallback, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import {
    Appbar,
    List,
    Text,
    useTheme,
    Divider,
    IconButton,
    Portal,
    Dialog,
    Button,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { getChatSessions, deleteSession, ChatSession } from "../utils/storage";

const HistoryScreen = ({ navigation }: any) => {
    const theme = useTheme();
    const [history, setHistory] = useState<ChatSession[]>([]);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

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

    const promptDelete = (id: string) => {
        setSessionToDelete(id);
        setIsDeleteDialogVisible(true);
    };

    const confirmDelete = () => {
        if (sessionToDelete) {
            deleteSession(sessionToDelete);
            loadHistory();
        }
        setIsDeleteDialogVisible(false);
        setSessionToDelete(null);
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
                        onPress={() => promptDelete(item.id)}
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
            {/* --- DELETE CONFIRMATION DIALOG --- */}
            <Portal>
                <Dialog
                    style={{ backgroundColor: theme.colors.surfaceVariant }}
                    visible={isDeleteDialogVisible}
                    onDismiss={() => setIsDeleteDialogVisible(false)}
                >
                    <Dialog.Title
                        style={{
                            fontFamily: "JetBrainsMono",
                            fontWeight: "bold",
                        }}
                    >
                        Delete Conversation?
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text>
                            Are you sure you want to delete this chat? This
                            action cannot be undone.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setIsDeleteDialogVisible(false)}>
                            Cancel
                        </Button>
                        <Button
                            onPress={confirmDelete}
                            textColor={theme.colors.error}
                        >
                            Delete
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
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
