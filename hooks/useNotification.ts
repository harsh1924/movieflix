import * as Notifications from "expo-notifications";
import { useState } from "react";
import Toast from "react-native-toast-message";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    })
})

export const useNotification = () => {
    const [persmissionGranted, setPermissionGranted] = useState<boolean>(false);

    const requestPermission = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
            Toast.show({
                type: "error",
                text1: "Notification permission denied",
            });
            return false;
        }

        setPermissionGranted(true);
        return true;
    }

    const scheduleNotification = async (title: string, date: Date, category: string) => {
        if (!persmissionGranted) {
            const granted = await requestPermission();
            if (!granted) return;
        }

        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);
        let trigger;

        // 30 min before show "Upcoming Reminder" notification
        if (diffMinutes > 30) {
            const triggerDate = new Date(date.getTime() - 30 * 60000);
            trigger = {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            } as Notifications.DateTriggerInput;

            Toast.show({
                type: "info",
                text1: "Reminder set (30 min before)",
            });
        } else if (diffMinutes > 0) {
            // If less than 30 min, schedule immediately
            const triggerDate = new Date(Date.now() + 2000); // 2 seconds from now
            trigger = {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            } as Notifications.DateTriggerInput;

            Toast.show({
                type: "info",
                text1: "Reminder set (starting soon)",
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Cannot set reminder in the past",
            });
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${category} Reminder 🎬`,
                body:
                    diffMinutes > 30
                        ? `${title} starts in 30 minutes ⏰`
                        : `${title} is starting soon 🎬`,
            },
            trigger,
        });
    }

    const sendInstantNotification = async (title: string, type: string, category: string) => {
        if (!persmissionGranted) {
            const granted = await requestPermission();
            if (!granted) return;
        }

        if (type === "saved") {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title:  `${category} Saved ✅`,
                    body: `You saved ${title} to your list`,
                },
                trigger: null, // Send immediately
            });
        } else if (type === "removed") {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `${category} Removed 🗑️`,
                    body: `You removed ${title} from your list`,
                },
                trigger: null, // Send immediately
            });
        }
    };

    return {
        scheduleNotification,
        sendInstantNotification,
    }

}