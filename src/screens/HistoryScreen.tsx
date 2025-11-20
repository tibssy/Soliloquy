import React from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { Appbar, List, Text, useTheme, Divider } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const HISTORY_DATA = [
    {
        id: "1",
        title: "Flutter vs. Flet",
        subtitle: "A discussion about mobile development...",
        date: "11/18",
    },
    {
        id: "2",
        title: "On-Device AI Models",
        subtitle: "Exploring the capabilities of Gemma...",
        date: "11/17",
    },
    {
        id: "3",
        title: "Best Pizza Toppings",
        subtitle: "An important and lengthy debate.",
        date: "11/16",
    },
    {
        id: "4",
        title: "React Native Performance",
        subtitle: "Optimizing FlatList for large datasets.",
        date: "11/15",
    },
    {
        id: "5",
        title: "Why is the sky blue?",
        subtitle: "Physics explanation regarding scattering.",
        date: "11/10",
    },
];

const HistoryScreen = ({ navigation }: any) => {
    const theme = useTheme();

    const renderItem = ({ item }: { item: (typeof HISTORY_DATA)[0] }) => (
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
            right={() => (
                <View style={styles.dateContainer}>
                    <Text
                        style={[
                            styles.dateText,
                            { color: theme.colors.onSurfaceVariant },
                        ]}
                    >
                        {item.date}
                    </Text>
                </View>
            )}
            onPress={() => console.log(`Open chat ${item.id}`)}
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
            </Appbar.Header>

            <FlatList
                data={HISTORY_DATA}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => (
                    <Divider style={{ opacity: 0.1 }} />
                )}
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
    dateContainer: {
        justifyContent: "center",
        paddingLeft: 8,
    },
    dateText: {
        fontFamily: "JetBrainsMono",
        fontSize: 10,
    },
});

export default HistoryScreen;
