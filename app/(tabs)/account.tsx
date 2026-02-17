import { useEffect } from "react";
import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedView } from "@/components/themed-view";
import { AppText } from "@/components/ux/AppText";
import { useAuthStore } from "@/stores/useAuthStore";
import { colors, spacing } from "@/theme";

WebBrowser.maybeCompleteAuthSession();

export default function AccountScreen() {
  const session = useAuthStore((s) => s.session);
  const signInWithApple = useAuthStore((s) => s.signInWithApple);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const signOut = useAuthStore((s) => s.signOut);

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const idToken = response.params.id_token;
      if (idToken) {
        signInWithGoogle(idToken).catch((e: any) => {
          Alert.alert("Sign in failed", e.message);
        });
      }
    }
  }, [response, signInWithGoogle]);

  const handleApple = async () => {
    try {
      await signInWithApple();
    } catch (e: any) {
      if (e.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Sign in failed", e.message);
      }
    }
  };

  const handleGoogle = () => {
    promptAsync();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e: any) {
      Alert.alert("Sign out failed", e.message);
    }
  };

  if (session) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <AppText variant="title" style={styles.title}>
              Account
            </AppText>
            <AppText
              variant="body"
              color={colors.textSecondary}
              style={styles.email}
            >
              {session.user.email}
            </AppText>
            <Pressable
              style={[styles.button, styles.signOutButton]}
              onPress={handleSignOut}
            >
              <AppText variant="bodySemiBold" color={colors.text}>
                Sign Out
              </AppText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <AppText variant="title" style={styles.title}>
            Account
          </AppText>
          <AppText
            variant="body"
            color={colors.textSecondary}
            style={styles.subtitle}
          >
            Sign in to sync your data across devices
          </AppText>

          <View style={styles.buttons}>
            {Platform.OS === "ios" && (
              <Pressable
                style={[styles.button, styles.appleButton]}
                onPress={handleApple}
              >
                <Ionicons
                  name="logo-apple"
                  size={20}
                  color={colors.background}
                />
                <AppText variant="bodySemiBold" color={colors.background}>
                  Sign in with Apple
                </AppText>
              </Pressable>
            )}

            <Pressable
              style={[styles.button, styles.googleButton]}
              onPress={handleGoogle}
            >
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
  email: {
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
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
  signOutButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
