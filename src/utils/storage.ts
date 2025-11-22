import { createMMKV } from "react-native-mmkv";
import { Message } from "../types/chat";

export const storage = createMMKV();

export const KEYS = {
    THEME_DARK_MODE: "preferences.darkMode",
    THEME_SEED_COLOR: "preferences.seedColor",
    CHAT_SESSIONS: "data.chatSessions",
};

export type ChatSession = {
    id: string;
    title: string;
    subtitle: string;
    date: string;
    modelId?: string;
    lastModified: number;
};

// --- GENERIC HELPERS ---
export const saveString = (key: string, value: string) =>
    storage.set(key, value);
export const getString = (key: string) => storage.getString(key);
export const saveBoolean = (key: string, value: boolean) =>
    storage.set(key, value);
export const getBoolean = (key: string) => storage.getBoolean(key);

// 1. GET ALL SESSIONS (For History Screen)
export const getChatSessions = (): ChatSession[] => {
    const json = storage.getString(KEYS.CHAT_SESSIONS);
    if (!json) return [];
    try {
        const sessions = JSON.parse(json) as ChatSession[];
        // Sort by newest first
        return sessions.sort((a, b) => b.lastModified - a.lastModified);
    } catch (e) {
        return [];
    }
};

// 2. SAVE OR UPDATE A SESSION (For Chat Screen)
export const saveChatSession = (session: ChatSession) => {
    const sessions = getChatSessions();
    const index = sessions.findIndex((s) => s.id === session.id);

    if (index !== -1) {
        // Update existing
        sessions[index] = session;
    } else {
        // Add new
        sessions.push(session);
    }

    storage.set(KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
};

// 3. SAVE MESSAGES (For a specific chat)
export const saveMessages = (sessionId: string, messages: Message[]) => {
    storage.set(`messages_${sessionId}`, JSON.stringify(messages));
};

// 4. GET MESSAGES
export const getMessages = (sessionId: string): Message[] => {
    const json = storage.getString(`messages_${sessionId}`);
    return json ? JSON.parse(json) : [];
};

// 5. DELETE SESSION
export const deleteSession = (sessionId: string) => {
    const sessions = getChatSessions().filter((s) => s.id !== sessionId);
    storage.set(KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
    storage.remove(`messages_${sessionId}`);
};
