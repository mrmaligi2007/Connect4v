import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, PermissionsAndroid } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MessageSquare, Power, Settings as SettingsIcon } from 'lucide-react-native';
import Header from '../components/Header';
import DeviceInfo from '../components/DeviceInfo';

export default function HomePage() {
  const router = useRouter();
  const [unitNumber, setUnitNumber] = useState('');
  const [password, setPassword] = useState('1234');
  const [relaySettings, setRelaySettings] = useState({
    accessControl: 'AUT',
    latchTime: '000',
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestAndroidPermissions();
    }
    loadData();
  }, []);

  const requestAndroidPermissions = async () => {
    try {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        PermissionsAndroid.PERMISSIONS.SEND_SMS,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ];
      const result = await PermissionsAndroid.requestMultiple(permissions);
      console.log('Permission results:', result);
      // Optionally, you could check if any permission is denied and handle accordingly.
    } catch (err) {
      console.warn('Permission request error:', err);
    }
  };

  const loadData = async () => {
    try {
      const savedUnitNumber = await AsyncStorage.getItem('unitNumber');
      console.log('Loaded unitNumber:', savedUnitNumber); // Add this line
      if (savedUnitNumber) setUnitNumber(savedUnitNumber);
      else console.warn('No unitNumber found in AsyncStorage');
      const savedPassword = await AsyncStorage.getItem('password');
      const savedRelaySettings = await AsyncStorage.getItem('relaySettings');

      if (savedPassword) setPassword(savedPassword);
      if (savedRelaySettings) setRelaySettings(JSON.parse(savedRelaySettings));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // SMS Commands
  const sendSMS = (command) => {
    if (!unitNumber) {
      alert('Please set a valid unit number in Settings.');
      return;
    }

    // For iOS, remove '+' if present.
    const formattedUnitNumber = Platform.OS === 'ios' ? unitNumber.replace('+', '') : unitNumber;

    const smsUrl = Platform.select({
      ios: `sms:${formattedUnitNumber}&body=${encodeURIComponent(command)}`,
      android: `sms:${formattedUnitNumber}?body=${encodeURIComponent(command)}`,
      default: `sms:${formattedUnitNumber}?body=${encodeURIComponent(command)}`,
    });
    console.log('SMS URL:', smsUrl);

    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (!supported) {
          alert('SMS is not available on this device. Please ensure an SMS app is installed.');
          return;
        }
        return Linking.openURL(smsUrl);
      })
      .catch((err) => {
        console.error('An error occurred while opening SMS:', err);
        alert('Failed to open SMS. Check the console for details.');
      });
  };

  // Control Relay
  const turnRelayOn = () => sendSMS(`${password}CC`);
  const turnRelayOff = () => sendSMS(`${password}DD`);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect4v</Text>
      </View>
      
      {unitNumber && (
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>{unitNumber}</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.onButton]} 
            onPress={turnRelayOn}
            activeOpacity={0.8}
          >
            <Power size={32} color="white" />
            <Text style={styles.controlButtonText}>ON</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.controlButton, styles.offButton]} 
            onPress={turnRelayOff}
            activeOpacity={0.8}
          >
            <Power size={32} color="white" />
            <Text style={styles.controlButtonText}>OFF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Access Control</Text>
          <Text style={styles.infoValue}>
            {relaySettings.accessControl === "AUT" ? "Authorized Only" : "All Numbers"}
          </Text>
          
          <Text style={styles.infoLabel}>Latch Time</Text>
          <Text style={styles.infoValue}>
            {relaySettings.latchTime === "000"
              ? "Momentary (0.5s)"
              : `${parseInt(relaySettings.latchTime)} seconds`}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.setupButton} 
          onPress={() => router.push('/setup')}
        >
          <SettingsIcon size={20} color="#555" />
          <Text style={styles.setupButtonText}>Setup Device</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    backgroundColor: '#3a86ff',
    paddingTop: 50,
    paddingBottom: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  deviceInfo: {
    backgroundColor: '#ddd',
    padding: 12,
    alignItems: 'center',
  },
  deviceInfoText: {
    fontSize: 14,
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  controlButton: {
    width: '48%',
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  onButton: {
    backgroundColor: '#4CAF50',
  },
  offButton: {
    backgroundColor: '#f44336',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  infoContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  setupButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  setupButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#555',
  },
});
