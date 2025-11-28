import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = { children?: React.ReactNode };

// This component enforces "app-level mandatory location" UX
export default function LocationGate({ children }: Props) {
  const [status, setStatus] = useState<Location.PermissionStatus | "checking">("checking");
  const [blocking, setBlocking] = useState<boolean>(false);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const start = async () => {
      subscription = (await checkAndHandlePermission()) || null;
    };

    start();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Check permission, request if needed
  async function checkAndHandlePermission() {
    console.log("[LocationGate] Checking permissions...");
    setStatus("checking");

    try {
      // Check foreground permission first
      let { status: fgStatus } = await Location.getForegroundPermissionsAsync();
      console.log("[LocationGate] Initial FG status:", fgStatus);

      if (fgStatus !== Location.PermissionStatus.GRANTED) {
        console.log("[LocationGate] Requesting FG permission...");
        const { status: newFgStatus } = await Location.requestForegroundPermissionsAsync();
        fgStatus = newFgStatus;
        console.log("[LocationGate] New FG status:", fgStatus);
      }

      if (fgStatus !== Location.PermissionStatus.GRANTED) {
        console.log("[LocationGate] FG permission denied.");
        setStatus(fgStatus);
        setBlocking(true);
        return;
      }

      // Check background permission (Android only usually needs explicit check/request here if we want BG)
      // For now, we'll focus on ensuring we have at least foreground access which is critical.
      // If background is needed, we can request it.
      if (Platform.OS === 'android' || Platform.OS === 'ios') {
        let { status: bgStatus } = await Location.getBackgroundPermissionsAsync();
        console.log("[LocationGate] Initial BG status:", bgStatus);

        if (bgStatus !== Location.PermissionStatus.GRANTED) {
          console.log("[LocationGate] Requesting BG permission...");
          const { status: newBgStatus } = await Location.requestBackgroundPermissionsAsync();
          bgStatus = newBgStatus;
          console.log("[LocationGate] New BG status:", bgStatus);
        }
        // If background denied, we might still allow app usage or block depending on requirements.
        // The original code blocked on everything, so we'll be strict but maybe lenient on BG if FG is there?
        // Original code: if (reqBg !== RESULTS.GRANTED) res = reqBg; -> blocked.
        if (bgStatus !== Location.PermissionStatus.GRANTED) {
          console.log("[LocationGate] BG permission denied.");
          setStatus(bgStatus);
          setBlocking(true);
          return;
        }
      }

      console.log("[LocationGate] All permissions granted. Starting location watch...");
      setStatus(Location.PermissionStatus.GRANTED);
      setBlocking(false);

      // Start watching position
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 120000, // 2 minutes
          distanceInterval: 0, // Update based on time, not distance
        },
        (location) => {
          console.log("[LocationGate] Location Update:", JSON.stringify(location, null, 2));
        }
      );

      // Save subscription to clean up later if needed (though this component seems to be permanent)
      // For a proper React effect, we should return this, but checkAndHandlePermission is async and called inside useEffect.
      // We'll assign it to a ref or state if we needed to cancel it, but for now we'll just let it run.
      // Ideally, we should refactor this to be inside the useEffect directly for cleaner cleanup.
      return subscription;

    } catch (err) {
      console.warn("checkAndHandlePermission error", err);
      setStatus("checking");
      setBlocking(true);
    }
  }

  // Open system settings
  async function openAppSettings() {
    try {
      await Linking.openSettings();
    } catch (e) {
      console.warn("open settings failed", e);
    }
  }

  // UI when permissions are missing — a blocking modal
  return (
    <>
      {children}
      <Modal visible={blocking} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Location required</Text>
            <Text style={styles.modalBody}>
              This app requires location access to function. Please allow Location (Always/Background) in system Settings.
            </Text>

            <TouchableOpacity
              style={[styles.btn, styles.primaryBtn]}
              onPress={() => {
                openAppSettings();
                // after user returns, retry check
                setTimeout(() => checkAndHandlePermission().catch(console.warn), 1200);
              }}
            >
              <Text style={styles.btnText}>Open Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.secondaryBtn]}
              onPress={() => {
                // Optionally allow user to continue in limited mode.
                Alert.alert("Limited mode", "You chose not to enable location. Some features will be disabled.");
                setBlocking(false);
              }}
            >
              <Text style={styles.btnText}>Continue without location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* show a small "checking" overlay while we check permissions */}
      {status === "checking" && (
        <View style={styles.checkingOverlay} pointerEvents="none">
          <ActivityIndicator />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 14,
    color: "#333",
    marginBottom: 18,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  primaryBtn: { backgroundColor: "#007bff" },
  secondaryBtn: { backgroundColor: "#6c757d" },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  checkingOverlay: {
    position: "absolute",
    left: 12,
    top: 12,
  },
});
