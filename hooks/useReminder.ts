import { useEffect, useState } from "react";
import * as Calendar from "expo-calendar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

export const useReminder = ({ id, title, runtime }: ReminderProps) => {
    const [reminderSet, setReminderSet] = useState<boolean>(false);

    useEffect(() => {
        const checkReminder = async () => {
            if (!id) return;

            try {
                const eventId = await AsyncStorage.getItem(`reminder-${id}`);
                if (!eventId) return;

                const event = await Calendar.getEventAsync(eventId);

                if (event) setReminderSet(true);
                else {
                    setReminderSet(false);
                    await AsyncStorage.removeItem(`reminder-${id}`);
                }


            } catch (error: any) {
                setReminderSet(false);
                await AsyncStorage.removeItem(`reminder-${id}`);
                console.log("Error checking reminder:", error.message);
            }
        }
        checkReminder();
    }, [id]);

    const addReminder = async (date: Date) => {
        if (!id || !title) return;

        try {
            const { status } = await Calendar.requestCalendarPermissionsAsync();

            if (status !== "granted") {
                Toast.show({
                    type: "error",
                    text1: "Calendar permission denied"
                });
                return;
            }

            const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
            if (!calendars.length) {
                Toast.show({
                    type: "error",
                    text1: "No calendar found on device"
                });
                return;
            }

            const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0];

            const eventId = await Calendar.createEventAsync(defaultCalendar.id, {
                title: `Watch ${title}`,
                startDate: date,
                endDate: new Date(date.getTime() + (runtime || 120) * 60000), // Default to 2 hours if runtime not provided
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            });
            await AsyncStorage.setItem(`reminder-${id}`, eventId);
            setReminderSet(true);

            Toast.show({
                type: "success",
                text1: "Reminder added successfully"
            });

        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Error adding reminder"
            });
            console.log("Error adding reminder:", error.message);
        }
    }

    const removeReminder = async () => {
        if (!id) return;

        try {
            const eventId = await AsyncStorage.getItem(`reminder-${id}`);
            if (!eventId) return;

            await Calendar.deleteEventAsync(eventId);
            await AsyncStorage.removeItem(`reminder-${id}`);
            setReminderSet(false);

            Toast.show({
                type: "success",
                text1: "Reminder removed successfully"
            });

        } catch (error: any) {
            Toast.show({
                type: "error",
                text1: "Error removing reminder"
            });
            console.log("Error removing reminder:", error.message);
        }
    }

    return {
        reminderSet,
        addReminder,
        removeReminder
    }
}