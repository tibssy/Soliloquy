import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
    Appbar,
    Text,
    List,
    useTheme,
    Divider,
    Icon,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomSwitch from "../components/CustomSwitch";

const ACCENT_COLORS = [
    "#9C27B0",
    "#2196F3",
    "#009688",
    "#4CAF50",
    "#FF9800",
    "#F44336",
    "#E91E63",
    "#9A9A9A",
];

const SettingsScreen = ({ navigation }: any) => {
    const theme = useTheme();

    const [isDarkMode, setIsDarkMode] = useState(true);
    const [selectedColor, setSelectedColor] = useState(ACCENT_COLORS[0]);

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: theme.colors.background },
            ]}
            edges={["bottom", "left", "right"]}
        >
            {/* Header with Back Button */}
            <Appbar.Header
                style={{ backgroundColor: theme.colors.background }}
                mode="center-aligned"
            >
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title="Settings"
                    titleStyle={styles.headerTitle}
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* SECTION: APPEARANCE */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: theme.colors.primary },
                        ]}
                    >
                        APPEARANCE
                    </Text>

                    {/* Dark Mode Toggle */}
                    <View style={styles.row}>
                        <Text
                            variant="bodyLarge"
                            style={{ fontFamily: "JetBrainsMono" }}
                        >
                            Dark Mode
                        </Text>
                        <CustomSwitch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                        />
                    </View>

                    {/* Accent Color Picker */}
                    <View style={styles.colorSection}>
                        <Text
                            variant="bodyLarge"
                            style={[
                                styles.label,
                                { fontFamily: "JetBrainsMono" },
                            ]}
                        >
                            Accent Color
                        </Text>
                        <View style={styles.colorGrid}>
                            {ACCENT_COLORS.map((color) => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color },
                                    ]}
                                >
                                    {selectedColor === color && (
                                        <View>
                                            <Icon
                                                source="check"
                                                size={20}
                                                color="white"
                                            />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <Divider style={styles.divider} />

                {/* SECTION: MODEL MANAGEMENT */}
                <View style={styles.section}>
                    <Text
                        style={[
                            styles.sectionTitle,
                            { color: theme.colors.primary },
                        ]}
                    >
                        MODEL MANAGEMENT
                    </Text>

                    <List.Item
                        title="Manage Models"
                        titleStyle={{ fontFamily: "JetBrainsMono" }}
                        right={(props) => (
                            <List.Icon {...props} icon="chevron-right" />
                        )}
                        onPress={() => console.log("Manage Models")}
                    />
                    <List.Item
                        title="Manage Knowledge Base"
                        titleStyle={{ fontFamily: "JetBrainsMono" }}
                        right={(props) => (
                            <List.Icon {...props} icon="chevron-right" />
                        )}
                        onPress={() => console.log("Manage KB")}
                    />
                </View>
            </ScrollView>
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
    scrollContent: {
        paddingBottom: 24,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginBottom: 16,
        letterSpacing: 1,
        fontFamily: "JetBrainsMono",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    label: {
        marginBottom: 12,
    },
    colorSection: {
        marginTop: 8,
    },
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
    },
    colorCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
    },
    divider: {
        marginVertical: 8,
        opacity: 0.2,
    },
});

export default SettingsScreen;
