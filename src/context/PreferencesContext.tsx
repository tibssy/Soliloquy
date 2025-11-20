import React, { createContext, useContext, useState, useMemo } from "react";

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
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [seedColor, setSeedColor] = useState("#9E9E9E");

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
