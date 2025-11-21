import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
    Banner,
    Text,
    TouchableRipple,
    useTheme,
    ActivityIndicator,
    Icon,
    Button,
} from "react-native-paper";
import { Directory, Paths } from "expo-file-system";
import { useLlama } from "../context/LlamaContext";

type ModelDef = {
    id: string;
    name: string;
    filename: string;
};

const AVAILABLE_MODELS: ModelDef[] = [
    {
        id: "gemma-270m",
        name: "Gemma 3 270M",
        filename: "gemma-3-270m-it-Q4_K_M.gguf",
    },
    {
        id: "gemma-1b",
        name: "Gemma 3 1B",
        filename: "gemma-3-1b-it-Q4_K_M.gguf",
    },
    {
        id: "llama-3.2-1b",
        name: "Llama 3.2 1B",
        filename: "Llama-3.2-1B-Instruct-Q4_K_M.gguf",
    },
    {
        id: "Llama-3.2-3B",
        name: "Llama 3.2 3B",
        filename: "Llama-3.2-3B-Instruct-Q4_K_M.gguf",
    },
];

interface Props {
    visible: boolean;
    onDismiss: () => void;
    onManageModels: () => void;
}

const ModelSelectorBanner = ({ visible, onDismiss, onManageModels }: Props) => {
    const theme = useTheme();
    const { loadModel, activeModelId, isModelLoading } = useLlama();
    const [downloadedModels, setDownloadedModels] = useState<string[]>([]);

    useEffect(() => {
        if (visible) {
            checkDownloads();
        }
    }, [visible]);

    const checkDownloads = async () => {
        const modelsDir = new Directory(Paths.document, "models");
        if (!modelsDir.exists) return;

        const files = await modelsDir.list();
        const filenames = files.map((f) => f.name);
        setDownloadedModels(filenames);
    };

    const handleSelect = (item: ModelDef) => {
        if (activeModelId === item.id) return;
        loadModel(item.filename, item.id);
        onDismiss();
    };

    return (
        <Banner
            visible={visible}
            // elevation={0}
            icon={({ size }) => (
                <Icon source="brain" size={size} color={theme.colors.primary} />
            )}
            actions={[
                {
                    label: "Manage Models",
                    onPress: onManageModels,
                },
                {
                    label: "Close",
                    onPress: onDismiss,
                },
            ]}
            style={{ backgroundColor: theme.colors.background }}
        >
            <View style={styles.contentContainer}>
                <Text style={styles.heading}>Select a Brain</Text>
                <ScrollView style={styles.scrollArea}>
                    {AVAILABLE_MODELS.map((item) => {
                        const isDownloaded = downloadedModels.includes(
                            item.filename
                        );
                        const isActive = activeModelId === item.id;

                        return (
                            <TouchableRipple
                                key={item.id}
                                onPress={() =>
                                    isDownloaded ? handleSelect(item) : null
                                }
                                disabled={!isDownloaded || isModelLoading}
                                style={[
                                    styles.item,
                                    isActive && {
                                        backgroundColor:
                                            theme.colors.secondaryContainer,
                                    },
                                ]}
                            >
                                <View style={styles.row}>
                                    <Icon
                                        source={
                                            isActive
                                                ? "radiobox-marked"
                                                : isDownloaded
                                                ? "radiobox-blank"
                                                : "cloud-download-outline"
                                        }
                                        size={20}
                                        color={
                                            isActive
                                                ? theme.colors.primary
                                                : theme.colors.onSurfaceVariant
                                        }
                                    />
                                    <View style={styles.textInfo}>
                                        <Text
                                            variant="bodyMedium"
                                            style={{
                                                color: isDownloaded
                                                    ? theme.colors.onSurface
                                                    : theme.colors
                                                          .onSurfaceDisabled,
                                                fontFamily: "JetBrainsMono",
                                                fontWeight: isActive
                                                    ? "bold"
                                                    : "normal",
                                            }}
                                        >
                                            {item.name}
                                        </Text>
                                    </View>
                                    {isActive && isModelLoading && (
                                        <ActivityIndicator size={16} />
                                    )}
                                </View>
                            </TouchableRipple>
                        );
                    })}
                </ScrollView>
            </View>
        </Banner>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        width: "100%",
        marginTop: 6,
    },
    heading: {
        fontWeight: "bold",
        marginBottom: 8,
        fontSize: 12,
        textTransform: "uppercase",
    },
    scrollArea: {
        height: 178,
    },
    item: {
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginBottom: 4,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    textInfo: {
        marginLeft: 12,
        flex: 1,
    },
});

export default ModelSelectorBanner;
