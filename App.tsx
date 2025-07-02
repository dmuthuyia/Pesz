import React, {useEffect} from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,    // ← the convenience hook
} from 'react-native-vision-camera';

export default function App() {
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back') ?? devices[0];

  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  if (hasPermission === null) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Requesting camera permission…</Text>
      </View>
    );
  }
  if (!hasPermission) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>
          Camera permission was denied. Please enable it in settings.
        </Text>
      </View>
    );
  }
  if (!device) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>
          No camera detected. On an emulator without a camera, nothing to show.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera style={StyleSheet.absoluteFill} device={device} isActive />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text:      { marginTop: 12, textAlign: 'center', fontSize: 16 },
});
