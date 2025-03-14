import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Linking, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useFocusEffect } from 'expo-router';
import { UserPlus, UserMinus, List } from 'lucide-react-native';

export default function AuthorizedUsersPage() {
  const router = useRouter();
  const [unitNumber, setUnitNumber] = useState('');
  const [password, setPassword] = useState('1234');
  const [serialNumber, setSerialNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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

  const sendSMS = async (command) => {
    if (!unitNumber) {
      Alert.alert('Error', 'Please set the relay phone number in settings');
      return;
    }

    const smsUrl = Platform.select({
      ios: `sms:${unitNumber}`,
      android: `sms:${unitNumber}?body=${encodeURIComponent(command)}`,
      default: `sms:${unitNumber}?body=${encodeURIComponent(command)}`,
    });

    if (Platform.OS === 'ios') {
      await Clipboard.setStringAsync(command);
      Alert.alert('Info', 'Command copied to clipboard. Please paste it in the SMS app.');
    }

    Linking.canOpenURL(smsUrl)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'SMS is not available on this device');
          return;
        }
        return Linking.openURL(smsUrl);
      })
      .catch(err => console.error('An error occurred', err));
  };

  const addAuthorizedUser = async () => {  // Mark function as async
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }
    if (!serialNumber || !/^\d+$/.test(serialNumber)) {
      Alert.alert('Error', 'User ID must be numeric');
      return;
    }
    const numValue = parseInt(serialNumber, 10);
    if (numValue < 1 || numValue > 200) {
      Alert.alert('Error', 'User ID must be between 1 and 200');
      return;
    }
    // Send SMS with or without time restrictions
    if (startTime && endTime) {
      await sendSMS(`${password}A${serialNumber}#${phoneNumber}#${startTime}#${endTime}#`);
    } else {
      await sendSMS(`${password}A${serialNumber}#${phoneNumber}#`);
    }
    // Update AsyncStorage with new user
    try {
      const savedUsers = await AsyncStorage.getItem('authorizedUsers');
      const users = savedUsers ? JSON.parse(savedUsers) : [];
      users.push({ serial: serialNumber, phone: phoneNumber, startTime, endTime });
      await AsyncStorage.setItem('authorizedUsers', JSON.stringify(users));
      Alert.alert('Success', 'Authorized user added and list updated.');
    } catch (error) {
      console.error('Error updating authorized users:', error);
    }
  };

  const deleteAuthorizedUser = async () => {  // Mark as async
    if (!serialNumber || !/^\d+$/.test(serialNumber)) {
      Alert.alert('Error', 'User ID must be numeric');
      return;
    }
    const numValue = parseInt(serialNumber, 10);
    if (numValue < 1 || numValue > 200) {
      Alert.alert('Error', 'User ID must be between 1 and 200');
      return;
    }
    await sendSMS(`${password}A${serialNumber}##`);
    try {
      const savedUsers = await AsyncStorage.getItem('authorizedUsers');
      let users = savedUsers ? JSON.parse(savedUsers) : [];
      // Remove user matching the current serialNumber
      users = users.filter(u => u.serial !== serialNumber);
      await AsyncStorage.setItem('authorizedUsers', JSON.stringify(users));
      Alert.alert('Success', 'Authorized user deleted and list updated.');
    } catch (error) {
      console.error('Error updating authorized users:', error);
    }
  };

  const deleteAllUsers = () => {
    Alert.alert(
      'Confirm Delete All',
      'Are you sure you want to delete all authorized users? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete All',
          onPress: () => sendSMS(`${password}AR#`),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/setup')}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Authorized Users</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add User</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>User ID (1-200)</Text>
            <TextInput
              style={styles.input}
              value={serialNumber}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 3);
                setSerialNumber(filtered);
              }}
              placeholder="Enter user ID"
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.timeInputsRow}>
            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>Start Time (Optional)</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="YYMMDDHHMM"
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
            
            <View style={styles.halfInputContainer}>
              <Text style={styles.inputLabel}>End Time (Optional)</Text>
              <TextInput
                style={styles.input}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="YYMMDDHHMM"
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>
          </View>

          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={addAuthorizedUser}
            >
              <UserPlus size={18} color="white" />
              <Text style={styles.buttonText}>Add User</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={deleteAuthorizedUser}
            >
              <UserMinus size={18} color="white" />
              <Text style={styles.buttonText}>Delete User</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.listButton}
            onPress={() => router.push("/authorized-users-list")}
          >
            <List size={18} color="#555" />
            <Text style={styles.listButtonText}>View Users List</Text>
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
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  timeInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 8,
  },
  listButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listButtonText: {
    color: '#555',
    fontSize: 16,
    marginLeft: 8,
  }
});