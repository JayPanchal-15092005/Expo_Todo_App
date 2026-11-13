import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get notification permission");
      return false;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Task Reminders",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#6366F1",
      });
    }

    return true;
  } catch (err) {
    console.error("Error setting up notifications:", err);
    return false;
  }
}

export async function scheduleTaskReminder(
  taskId: number,
  title: string,
  dueDate: string, // YYYY-MM-DD
  dueTime?: string // HH:mm
): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    // First cancel any existing notification for this task
    await cancelTaskReminder(taskId);

    let targetDate: Date;
    if (dueTime) {
      const [hours, minutes] = dueTime.split(":").map(Number);
      targetDate = new Date(`${dueDate}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`);
    } else {
      // Default to 9:00 AM on due date
      targetDate = new Date(`${dueDate}T09:00:00`);
    }

    const now = new Date();
    if (targetDate.getTime() <= now.getTime()) {
      return null; // Don't schedule in the past
    }

    const identifier = `task-reminder-${taskId}`;
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: "Task Due Reminder ⏰",
        body: title,
        sound: true,
        data: { taskId },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: targetDate,
      },
    });

    return identifier;
  } catch (error) {
    console.error("Error scheduling task reminder:", error);
    return null;
  }
}

export async function cancelTaskReminder(taskId: number): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const identifier = `task-reminder-${taskId}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.error("Error canceling notification:", error);
  }
}

export async function scheduleDailyBriefing(hour = 9, minute = 0): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.cancelScheduledNotificationAsync("daily-briefing");

    await Notifications.scheduleNotificationAsync({
      identifier: "daily-briefing",
      content: {
        title: "Good Morning! ☀️",
        body: "Check your pending tasks and daily habits for today.",
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (error) {
    console.error("Error scheduling daily briefing:", error);
  }
}
