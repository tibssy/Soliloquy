import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, FlatList, Platform } from "react-native";
import {
    Appbar,
    Text,
    IconButton,
    useTheme,
    Surface,
    ProgressBar,
    Portal,
    Dialog,
    Button,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { File, Directory, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
    setupNotifications,
    showDownloadNotification,
    dismissDownloadNotification,
    showCompletionNotification,
} from "../utils/notifications";
import { useLlama } from "../context/LlamaContext"; //

type ModelDef = {
    id: string;
    name: string;
    description: string;
    sizeStr: string;
    filename: string;
    url: string;
};

const AVAILABLE_MODELS: ModelDef[] = [
    {
        id: "gemma-270m",
        name: "Gemma 3 270M",
        description: "Ultra-lightweight, fast instruction model.",
        sizeStr: "270 MB",
        filename: "gemma-3-270m-it-Q4_K_M.gguf",
        url: "https://huggingface.co/unsloth/gemma-3-270m-it-GGUF/resolve/main/gemma-3-270m-it-Q4_K_M.gguf?download=true",
    },
    {
        id: "gemma-1b",
        name: "Gemma 3 1B",
        description: "Balanced performance and speed.",
        sizeStr: "800 MB",
        filename: "gemma-3-1b-it-Q4_K_M.gguf",
        url: "https://huggingface.co/unsloth/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf?download=true",
    },
    {
        id: "llama-3.2-1b",
        name: "Llama 3.2 1B",
        description: "Meta's latest efficient small model.",
        sizeStr: "808 MB",
        filename: "Llama-3.2-1B-Instruct-Q4_K_M.gguf",
        url: "https://huggingface.co/unsloth/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf?download=true",
    },
    {
        id: "Llama-3.2-3B",
        name: "Llama 3.2 3B",
        description: "Meta's latest efficient small model.",
        sizeStr: "2.02 GB",
        filename: "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
        url: "https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf?download=true",
    },
];

const modelsDir = new Directory(Paths.document, "models");

const ModelCard = ({ model }: { model: ModelDef }) => {
    const theme = useTheme();
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const modelFile = new File(modelsDir, model.filename);
    const downloadResumable = useRef<FileSystemLegacy.DownloadResumable | null>(
        null
    );
    const lastNotificationUpdate = useRef<number>(0);
    const { activeModelId, unloadModel } = useLlama();

    useEffect(() => {
        checkFileStatus();
    }, []);

    const checkFileStatus = () => {
        if (modelFile.exists) {
            setIsDownloaded(true);
            setProgress(1);
        } else {
            setIsDownloaded(false);
            setProgress(0);
        }
    };

    const handleDownload = async () => {
        try {
            await setupNotifications();
            if (!modelsDir.exists) modelsDir.create();

            setIsDownloading(true);
            await activateKeepAwakeAsync();
            await showDownloadNotification(
                model.name,
                "Starting download...",
                0
            );

            const callback = (
                downloadProgress: FileSystemLegacy.DownloadProgressData
            ) => {
                const p =
                    downloadProgress.totalBytesWritten /
                    downloadProgress.totalBytesExpectedToWrite;
                setProgress(p);

                const currentPercent = Math.floor(p * 100);
                const lastPercent = lastNotificationUpdate.current;

                if (currentPercent > lastPercent + 5) {
                    lastNotificationUpdate.current = currentPercent;
                    showDownloadNotification(
                        model.name,
                        "Downloading...",
                        currentPercent
                    );
                }
            };

            downloadResumable.current =
                FileSystemLegacy.createDownloadResumable(
                    model.url,
                    modelFile.uri,
                    {},
                    callback
                );

            const result = await downloadResumable.current.downloadAsync();

            if (result && result.uri) {
                setIsDownloaded(true);
                setIsDownloading(false);
                await dismissDownloadNotification(model.name);
                await showCompletionNotification(model.name, true);
            }
        } catch (e) {
            console.error(e);
            setIsDownloading(false);
            await dismissDownloadNotification(model.name);
            await showCompletionNotification(model.name, false);
        } finally {
            await deactivateKeepAwake(model.id);
        }
    };

    const confirmDelete = async () => {
        try {
            if (activeModelId === model.id) {
                await unloadModel();
            }

            if (modelFile.exists) {
                modelFile.delete();
                setIsDownloaded(false);
                setProgress(0);
            }
        } catch (e) {
            console.error("Error deleting model:", e);
        } finally {
            setIsDeleteDialogVisible(false);
        }
    };

    const handleCancelDownload = async () => {
        if (downloadResumable.current) {
            try {
                await downloadResumable.current.pauseAsync();
                if (modelFile.exists) modelFile.delete();
            } catch (e) {
                console.log(e);
            }
        }
        await dismissDownloadNotification(model.name);
        await deactivateKeepAwake(model.id);

        setIsDownloading(false);
        setProgress(0);
    };

    return (
        <>
            <Surface
                style={[
                    styles.card,
                    { backgroundColor: theme.colors.surfaceVariant },
                ]}
                elevation={2}
            >
                <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                        <IconButton
                            icon="chip"
                            size={32}
                            iconColor={theme.colors.primary}
                            style={{ margin: 0 }}
                        />
                    </View>

                    <View style={styles.textContainer}>
                        <Text
                            variant="titleMedium"
                            style={{
                                fontFamily: "JetBrainsMono",
                                fontWeight: "bold",
                                color: theme.colors.onSurface,
                            }}
                        >
                            {model.name}
                        </Text>
                        <Text
                            variant="bodySmall"
                            style={{
                                color: theme.colors.onSurfaceVariant,
                                marginTop: 4,
                            }}
                        >
                            {model.description}
                        </Text>
                        <Text
                            variant="labelSmall"
                            style={{
                                fontFamily: "JetBrainsMono",
                                color: theme.colors.primary,
                                marginTop: 4,
                            }}
                        >
                            Size: {model.sizeStr}
                        </Text>
                    </View>

                    <View style={styles.actionContainer}>
                        {isDownloading ? (
                            <IconButton
                                icon="close"
                                size={24}
                                onPress={handleCancelDownload}
                                iconColor={theme.colors.error}
                            />
                        ) : isDownloaded ? (
                            <IconButton
                                icon="trash-can-outline"
                                size={24}
                                onPress={() => setIsDeleteDialogVisible(true)}
                                iconColor={theme.colors.onSurfaceVariant}
                            />
                        ) : (
                            <IconButton
                                icon="download-outline"
                                size={24}
                                onPress={handleDownload}
                                iconColor={theme.colors.primary}
                            />
                        )}
                    </View>
                </View>

                {(isDownloading || (isDownloaded && progress === 1)) && (
                    <ProgressBar
                        progress={progress}
                        color={
                            isDownloaded
                                ? theme.colors.primary
                                : theme.colors.secondary
                        }
                        style={styles.progressBar}
                    />
                )}
                {isDownloading && (
                    <Text
                        style={[
                            styles.progressText,
                            { color: theme.colors.onSurfaceVariant },
                        ]}
                    >
                        {(progress * 100).toFixed(0)}%
                    </Text>
                )}
            </Surface>

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
                        Delete Model?
                    </Dialog.Title>
                    <Dialog.Content>
                        <Text variant="bodyMedium">
                            Are you sure you want to delete{" "}
                            <Text
                                style={{
                                    fontWeight: "bold",
                                    color: theme.colors.primary,
                                }}
                            >
                                {model.name}
                            </Text>
                            ? This will remove the file from your device.
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
        </>
    );
};

const ModelsScreen = ({ navigation }: any) => {
    const theme = useTheme();

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
                    title="Manage Models"
                    titleStyle={styles.headerTitle}
                />
            </Appbar.Header>

            <FlatList
                data={AVAILABLE_MODELS}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => <ModelCard model={item} />}
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
        padding: 16,
        gap: 16,
    },
    card: {
        borderRadius: 12,
        overflow: "hidden",
    },
    cardContent: {
        flexDirection: "row",
        padding: 16,
        alignItems: "center",
    },
    iconContainer: {
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    actionContainer: {
        marginLeft: 8,
    },
    progressBar: {
        height: 4,
    },
    progressText: {
        position: "absolute",
        bottom: 8,
        right: 16,
        fontSize: 14,
        fontFamily: "JetBrainsMono",
    },
});

export default ModelsScreen;
