import "@/lib/notificationScheduler";

import {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from "@expo-google-fonts/raleway";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

import { hasCompletedOnboarding } from "@/components/screens/OnboardingScreen";
import { useAlarmScheduler } from "@/hooks/useAlarmScheduler";
import { useNotificationResponse } from "@/hooks/useNotificationResponse";
import { hasPermissions, scheduleNotifications } from "@/lib/notifications";
import { registerBackgroundReschedule } from "@/lib/notificationScheduler";
import { initializePurchases, loginPurchases } from "@/lib/purchases";
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";
import { useAlarmStore } from "@/stores/useAlarmStore";
import { useAuthStore } from "@/stores/useAuthStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  const router = useRouter();
  const initialize = useAuthStore((s) => s.initialize);
  const session = useAuthStore((s) => s.session);
  const checkSubscription = useSubscriptionStore((s) => s.checkSubscription);

  useAlarmScheduler();
  useNotificationResponse();

  useEffect(() => {
    initializePurchases();
    checkSubscription();
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      loginPurchases(session.user.id);
    }
  }, [session?.user.id]);

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  // For returning users (already onboarded), schedule notifications on hydration.
  // First-time users have permissions handled by OnboardingScreen.
  useEffect(() => {
    useAlarmStore.persist.onFinishHydration(async () => {
      const onboarded = await hasCompletedOnboarding();
      if (!onboarded) return;
      useAlarmStore.getState().clearExpiredMute();
      const granted = await hasPermissions();
      if (granted) {
        await scheduleNotifications(useAlarmStore.getState());
        await registerBackgroundReschedule();
      }
    });
  }, []);

  useEffect(() => {
    if (!fontsLoaded) return;
    async function handleOnboarding() {
      const FORCE_ONBOARDING = true; // TODO: remove before release
      const onboarded = !FORCE_ONBOARDING && (await hasCompletedOnboarding());
      if (!onboarded) {
        router.replace("/onboarding");
      }
      SplashScreen.hideAsync();
    }
    handleOnboarding();
  }, [fontsLoaded, router]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="paywall" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
