import "@/lib/notificationScheduler";

import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import {
  Raleway_400Regular,
  Raleway_500Medium,
  Raleway_600SemiBold,
  Raleway_700Bold,
} from '@expo-google-fonts/raleway';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { useAuthStore } from '@/stores/useAuthStore';
import { useAlarmStore } from '@/stores/useAlarmStore';
import { useAlarmScheduler } from '@/hooks/useAlarmScheduler';
import { requestPermissions, scheduleNotifications } from '@/lib/notifications';
import { registerBackgroundReschedule } from '@/lib/notificationScheduler';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_500Medium,
    Raleway_600SemiBold,
    Raleway_700Bold,
  });

  const initialize = useAuthStore((s) => s.initialize);

  useAlarmScheduler();

  useEffect(() => {
    const unsubscribe = initialize();
    return unsubscribe;
  }, [initialize]);

  useEffect(() => {
    useAlarmStore.persist.onFinishHydration(async () => {
      useAlarmStore.getState().clearExpiredMute();
      const granted = await requestPermissions();
      if (granted) {
        await scheduleNotifications(useAlarmStore.getState());
        await registerBackgroundReschedule();
      }
    });
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
