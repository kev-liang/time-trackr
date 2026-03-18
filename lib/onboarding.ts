import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "onboarding_done";

export async function markOnboardingDone() {
  await AsyncStorage.setItem(ONBOARDING_KEY, "1");
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val !== null;
}

