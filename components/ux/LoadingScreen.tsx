import { StyleSheet, Text, View } from "react-native";

import { ClockLoading } from "@/components/ux/ClockLoading";
import { colors, fonts } from "@/theme";

export function LoadingScreen() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.clock}>
        <ClockLoading />
      </View>
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
  clock: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    marginTop: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.primary,
    fontWeight: "bold",
  },
});
