import React from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ChatScreen from "./src/screens/ChatScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { createThemeFromSeed } from "./src/utils/createTheme";

const SEED_COLOR = "#B8B8B8";
const DARK_MODE = true;

const theme = {
    ...createThemeFromSeed(SEED_COLOR, DARK_MODE),
    roundness: 2,
};

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <StatusBar
                style="light"
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
}
