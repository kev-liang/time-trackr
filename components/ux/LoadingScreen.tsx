import { Image, StyleSheet, Text, View } from "react-native";

import { colors, fonts } from "@/theme";

export function LoadingScreen() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        source={require("@/assets/primary-loading.gif")}
        style={styles.gif}
      />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  gif: {
    width: 80,
    height: 80,
  },
  text: {
    marginTop: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
