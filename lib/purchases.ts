import { Platform } from "react-native";
import Purchases, { LOG_LEVEL } from "react-native-purchases";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "";
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "";

export function initializePurchases() {
  const apiKey = Platform.OS === "ios" ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) return;
  Purchases.setLogLevel(LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey });
}

export async function loginPurchases(userId: string) {
  await Purchases.logIn(userId);
}

export async function purchaseOffering(): Promise<boolean> {
  const offerings = await Purchases.getOfferings();
  const offering = offerings.current ?? offerings.all["default"];
  const pkg = offering?.availablePackages[0];
  if (!pkg) throw new Error("No offering available");
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return Object.keys(customerInfo.entitlements.active).length > 0;
}

export async function restorePurchases(): Promise<boolean> {
  const customerInfo = await Purchases.restorePurchases();
  return Object.keys(customerInfo.entitlements.active).length > 0;
}

export async function getIsPro(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return Object.keys(info.entitlements.active).length > 0;
  } catch {
    return false;
  }
}
