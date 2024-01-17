import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { registerBackgroundFetchOnce, requestLocationPermissionsAsync, requestNotificationPermissionsAsync, updateProximityData } from './Proximity';
import { createLogger } from './modules/Log';

const logger = createLogger('App');
const console = logger

export default function App() {

  useEffect(() => {
    console.debug('Geofencing...');
    (async () => {
      const granted = await requestNotificationPermissionsAsync()
      const status = await requestLocationPermissionsAsync()
      if (granted && status === "granted") {
        await updateProximityData()
        await registerBackgroundFetchOnce()
      }
    })()
  }, []);

  return (
    <View style={styles.container}>
      <Text>Testing Proximity</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
