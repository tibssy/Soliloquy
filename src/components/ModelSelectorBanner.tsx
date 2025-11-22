import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
    Banner,
    Text,
    TouchableRipple,
    useTheme,
    ActivityIndicator,
    Icon,
} from "react-native-paper";
import { Directory, Paths } from "expo-file-system";
import { useLlama } from "../context/LlamaContext";
import { AVAILABLE_MODELS, ModelDef } from "../data/models";

interface Props {
    visible: boolean;
    onDismiss: () => void;
    onManageModels: () => void;
}

const ModelSelectorBanner = ({ visible, onDismiss, onManageModels }: Props) => {
    const theme = useTheme();
    const { loadModel, activeModelId, isModelLoading, unloadModel } =
        useLlama();
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

    const bannerActions = useMemo(() => {
        const actions = [
            {
                label: "Manage Models",
                onPress: onManageModels,
            },
        ];

        if (activeModelId) {
            actions.push({
                label: "Unload",
                onPress: () => {
                    unloadModel();
                    onDismiss();
                },
            });
        }

        actions.push({
            label: "Close",
            onPress: onDismiss,
        });

        return actions;
    }, [activeModelId, onManageModels, onDismiss, unloadModel]);

    return (
        <Banner
            visible={visible}
            // elevation={0}
            icon={({ size }) => (
                <Icon source="brain" size={size} color={theme.colors.primary} />
            )}
            actions={bannerActions}
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
