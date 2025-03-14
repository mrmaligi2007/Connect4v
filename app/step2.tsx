import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Linking, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Key, Save } from 'lucide-react-native';

export default function Step2Page() {
  const router = useRouter();
  const [unitNumber, setUnitNumber] = useState('');
  const [password, setPassword] = useState('1234');
  const [newPassword, setNewPassword] = useState('');

  const loadData = async () => {
    try {
      const savedUnitNumber = await AsyncStorage.getItem('unitNumber');
      const savedPassword = await AsyncStorage.getItem('password');

      if (savedUnitNumber) setUnitNumber(savedUnitNumber);
      if (savedPassword) setPassword(savedPassword);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const saveToLocalStorage = async (newPwd) => {
    try {
      await AsyncStorage.setItem('password', newPwd);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  // SMS Commands
  const sendSMS = (command) => {
    const smsUrl = Platform.select({
      ios: `sms:${unitNumber}&body=${encodeURIComponent(command)}`,
      android: `sms:${unitNumber}?body=${encodeURIComponent(command)}`,
      default: `sms:${unitNumber}?body=${encodeURIComponent(command)}`,
    });
    
    Linking.canOpenURL(smsUrl)
      .then(supported => {
        if (!supported) {
          alert('SMS is not available on this device');
          return;
        }
        return Linking.openURL(smsUrl);
      })
      .catch(err => console.error('An error occurred', err));
  };

  // Change Password
  const changePassword = () => {
    if (!newPassword || newPassword.length !== 4 || !/^\d+$/.test(newPassword)) {
      alert('Password must be 4 digits');
      return;
    }
    sendSMS(`${password}P${newPassword}`);
    setPassword(newPassword);
    setNewPassword('');
    saveToLocalStorage(newPassword);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/setup')}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardDescription}>
            Change the 4-digit admin password for your Connect4v device.
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.currentPasswordContainer}>
              <Key size={18} color="#777" style={styles.passwordIcon} />
              <Text style={styles.currentPassword}>{password}</Text>
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 4);
                setNewPassword(filtered);
              }}
              placeholder="Enter 4-digit password"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
            <Text style={styles.inputHint}>Password must be exactly 4 digits</Text>
          </View>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={changePassword}
          >
            <Save size={18} color="white" />
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  cardDescription: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  currentPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    padding: 12,
  },
  passwordIcon: {
    marginRight: 8,
  },
  currentPassword: {
    fontSize: 18,
    color: '#555',
    letterSpacing: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#888',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
