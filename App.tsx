// App.tsx
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import HomeScreen from "./src/screens/ChatScreen";
import { View } from "react-native";
import { createThemeFromSeed } from "./src/utils/createTheme";

const SEED_COLOR = "#9E9E9E";
const DARK_MODE = true;

const theme = {
    ...createThemeFromSeed(SEED_COLOR, DARK_MODE),
    roundness: 2,
};

export default function App() {
    return (
        <PaperProvider theme={theme}>
            <StatusBar
                style="light"
                backgroundColor={theme.colors.background}
            />
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <HomeScreen />
            </View>
        </PaperProvider>
    );
}
