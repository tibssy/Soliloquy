import React, {
    createContext,
    useContext,
    useState,
    useMemo,
    useEffect,
} from "react";
import { storage, KEYS } from "../utils/storage";

type PreferencesContextType = {
    isDarkMode: boolean;
    seedColor: string;
    toggleTheme: () => void;
    setSeedColor: (color: string) => void;
};

const PreferencesContext = createContext<PreferencesContextType>({
    isDarkMode: true,
    seedColor: "#9E9E9E",
    toggleTheme: () => {},
    setSeedColor: () => {},
});

export const PreferencesProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    let initialDarkMode = true;
    if (storage.contains(KEYS.THEME_DARK_MODE)) {
        initialDarkMode = !!storage.getBoolean(KEYS.THEME_DARK_MODE);
    }

    const initialSeedColor =
        storage.getString(KEYS.THEME_SEED_COLOR) ?? "#9E9E9E";

    const [isDarkMode, setIsDarkMode] = useState<boolean>(initialDarkMode);
    const [seedColor, setSeedColor] = useState<string>(initialSeedColor);

    useEffect(() => {
        storage.set(KEYS.THEME_DARK_MODE, isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        storage.set(KEYS.THEME_SEED_COLOR, seedColor);
    }, [seedColor]);

    const toggleTheme = () => {
        setIsDarkMode((prev) => !prev);
    };

    const value = useMemo(
        () => ({
            isDarkMode,
            seedColor,
            toggleTheme,
            setSeedColor,
        }),
        [isDarkMode, seedColor]
    );

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => useContext(PreferencesContext);
