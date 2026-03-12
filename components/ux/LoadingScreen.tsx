import { Image, StyleSheet, View } from "react-native";

export function LoadingScreen() {
  return (
    <View style={styles.container} pointerEvents="none">
      <Image
        source={require("@/assets/primary-loading.gif")}
        style={styles.gif}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  gif: {
    width: 80,
    height: 80,
  },
});
