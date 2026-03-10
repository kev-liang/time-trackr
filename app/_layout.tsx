import "@/lib/notificationScheduler";

import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from '@expo-google-fonts/raleway';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

configureReanimatedLogger({ level: ReanimatedLogLevel.warn, strict: false });

import { useAuthStore } from '@/stores/useAuthStore';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { useAlarmScheduler } from '@/hooks/useAlarmScheduler';
import { useNotificationResponse } from '@/hooks/useNotificationResponse';
import { requestPermissions, scheduleNotifications } from '@/lib/notifications';
import { registerBackgroundReschedule } from '@/lib/notificationScheduler';
import { hasCompletedOnboarding } from '@/components/screens/OnboardingScreen';

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

  useAlarmScheduler();
  useNotificationResponse();

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
      const granted = await requestPermissions();
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
      const onboarded = !FORCE_ONBOARDING && await hasCompletedOnboarding();
      if (!onboarded) {
        router.replace('/onboarding');
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
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
