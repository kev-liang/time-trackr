import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { AppText } from "@/components/ux/AppText";
import { useAuthStore } from "@/stores/useAuthStore";
import { colors, spacing } from "@/theme";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const signInWithApple = useAuthStore((s) => s.signInWithApple);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);

  const handleApple = async () => {
    try {
      await signInWithApple();
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Sign in failed", e.message);
      }
    }
  };

  const handleGoogle = async () => {
    try {
      // Google OAuth requires an auth session flow to get the id_token
      // The user needs to configure their Google Client ID in .env
      Alert.alert(
        "Google Sign In",
        "Google Sign In requires additional setup. Please configure your Google Client ID.",
      );
    } catch (e: any) {
      Alert.alert("Sign in failed", e.message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>
            time trackr
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Track how your time is spent
          </AppText>

          <View style={styles.buttons}>
            {Platform.OS === "ios" && (
              <Pressable style={[styles.button, styles.appleButton]} onPress={handleApple}>
                <Ionicons name="logo-apple" size={20} color={colors.background} />
                <AppText variant="bodySemiBold" color={colors.background}>
                  Sign in with Apple
                </AppText>
              </Pressable>
            )}

            <Pressable style={[styles.button, styles.googleButton]} onPress={handleGoogle}>
              <Ionicons name="logo-google" size={20} color={colors.text} />
              <AppText variant="bodySemiBold" color={colors.text}>
                Sign in with Google
              </AppText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  buttons: {
    gap: spacing.md,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  appleButton: {
    backgroundColor: colors.text,
  },
  googleButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
