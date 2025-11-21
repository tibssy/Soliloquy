import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const DOWNLOAD_CHANNEL_ID = "download-channel";

export async function setupNotifications() {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(DOWNLOAD_CHANNEL_ID, {
            name: "Model Downloads",
            importance: Notifications.AndroidImportance.LOW,
            vibrationPattern: [0],
            lightColor: "#FF231F7C",
            showBadge: false,
        });
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
}

export async function showDownloadNotification(
    title: string,
    body: string,
    progressPercent: number
) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body: `${body} (${progressPercent}%)`,
            data: { type: "download" },
            sticky: true,
            autoDismiss: false,
        },
        trigger: null,
        identifier: `download-${title}`,
    });
}

export async function dismissDownloadNotification(title: string) {
    await Notifications.dismissNotificationAsync(`download-${title}`);
}

export async function showCompletionNotification(
    title: string,
    success: boolean
) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: success ? "Download Complete" : "Download Failed",
            body: success
                ? `${title} is ready to use.`
                : `Could not download ${title}.`,
        },
        trigger: null,
    });
}
