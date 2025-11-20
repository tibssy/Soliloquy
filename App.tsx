import React, { useMemo } from "react";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChatScreen from "./src/screens/ChatScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { createThemeFromSeed } from "./src/utils/createTheme";
import {
    PreferencesProvider,
    usePreferences,
} from "./src/context/PreferencesContext";

const Stack = createNativeStackNavigator();

const AppContent = () => {
    const { isDarkMode, seedColor } = usePreferences();

    const theme = useMemo(() => {
        const generatedTheme = createThemeFromSeed(seedColor, isDarkMode);
        return {
            ...generatedTheme,
            roundness: 2,
        };
    }, [isDarkMode, seedColor]);

    return (
        <PaperProvider theme={theme}>
            <StatusBar
                style={isDarkMode ? "light" : "dark"}
                backgroundColor={theme.colors.background}
            />
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Chat"
                    screenOptions={{
                        headerShown: false,
                        animation: "ios_from_right",
                        contentStyle: {
                            backgroundColor: theme.colors.background,
                        },
                    }}
                >
                    <Stack.Screen name="Chat" component={ChatScreen} />
                    <Stack.Screen name="Settings" component={SettingsScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </PaperProvider>
    );
};

export default function App() {
    return (
        <PreferencesProvider>
            <AppContent />
        </PreferencesProvider>
    );
}
