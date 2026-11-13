import { ThemeProvide } from "@/hooks/useTheme";
import { requestNotificationPermissions, scheduleDailyBriefing } from "@/services/notifications";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    // Request notification permission and set up daily reminder
    requestNotificationPermissions().then((granted) => {
      if (granted) {
        scheduleDailyBriefing(9, 0); // 9:00 AM daily briefing
      }
    });
  }, []);

  return (
    <ThemeProvide>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvide>
  );
}
