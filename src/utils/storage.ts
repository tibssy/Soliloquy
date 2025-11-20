import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV();

export const KEYS = {
    THEME_DARK_MODE: "preferences.darkMode",
    THEME_SEED_COLOR: "preferences.seedColor",
    CHAT_HISTORY: "data.chatHistory",
};

export const saveBoolean = (key: string, value: boolean) =>
    storage.set(key, value);
export const getBoolean = (key: string) => storage.getBoolean(key);

export const saveString = (key: string, value: string) =>
    storage.set(key, value);
export const getString = (key: string) => storage.getString(key);

export const saveObject = (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
};

export const getObject = <T>(key: string): T | null => {
    const json = storage.getString(key);
    return json ? JSON.parse(json) : null;
};
