import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Phone, Clock, UserPlus, UserMinus, Save } from 'lucide-react-native';

export default function AuthorizedUsersPage() {
  const router = useRouter();
  const [unitNumber, setUnitNumber] = useState('');
  const [password, setPassword] = useState('1234');
  const [authorizedUsers, setAuthorizedUsers] = useState([
    { serial: '001', phone: '', startTime: '', endTime: '' },
    { serial: '002', phone: '', startTime: '', endTime: '' },
    { serial: '003', phone: '', startTime: '', endTime: '' },
    { serial: '004', phone: '', startTime: '', endTime: '' },
    { serial: '005', phone: '', startTime: '', endTime: '' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedUnitNumber = await AsyncStorage.getItem('unitNumber');
      const savedPassword = await AsyncStorage.getItem('password');
      const savedAuthorizedUsers = await AsyncStorage.getItem('authorizedUsers');

      if (savedUnitNumber) setUnitNumber(savedUnitNumber);
      if (savedPassword) setPassword(savedPassword);
      if (savedAuthorizedUsers) setAuthorizedUsers(JSON.parse(savedAuthorizedUsers));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveToLocalStorage = async () => {
    try {
      await AsyncStorage.setItem('authorizedUsers', JSON.stringify(authorizedUsers));
      alert('User settings saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save user settings');
    }
  };

  // SMS Commands
  const sendSMS = (command) => {
    const smsUrl = Platform.select({
      ios: `sms:${unitNumber}`, // Removed prefilled body on iOS
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

  // Manage Authorized Users
  const addAuthorizedUser = (index) => {
    const user = authorizedUsers[index];
    if (!user.phone) {
      alert('Please enter a phone number');
      return;
    }

    let command = `${password}A${user.serial}#${user.phone}#`;

    // Add time restrictions if provided
    if (user.startTime && user.endTime) {
      command += `${user.startTime}#${user.endTime}#`;
    }

    sendSMS(command);
  };

  const deleteAuthorizedUser = (index) => {
    const user = authorizedUsers[index];
    sendSMS(`${password}A${user.serial}##`);

    // Clear the user data in state
    const newUsers = [...authorizedUsers];
    newUsers[index] = { ...newUsers[index], phone: '', startTime: '', endTime: '' };
    setAuthorizedUsers(newUsers);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/step3')}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.description}>
          Add or modify users who can control your device. Valid IDs range from 001-200.
        </Text>

        {authorizedUsers.map((user, index) => (
          <View key={index} style={styles.userCard}>
            <View style={styles.userCardHeader}>
              <Text style={styles.userTitle}>User {parseInt(user.serial)}</Text>
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Serial Number</Text>
              <View style={styles.serialInputContainer}>
                <Text style={styles.serialPrefix}>#</Text>
                <TextInput
                  style={styles.serialInput}
                  value={user.serial}
                  onChangeText={(text) => {
                    const newUsers = [...authorizedUsers];
                    newUsers[index].serial = text.replace(/\D/g, '').padStart(3, '0');
                    setAuthorizedUsers(newUsers);
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.phoneInputContainer}>
                <Phone size={16} color="#777" style={styles.fieldIcon} />
                <TextInput
                  style={styles.phoneInput}
                  value={user.phone}
                  onChangeText={(text) => {
                    const newUsers = [...authorizedUsers];
                    newUsers[index].phone = text;
                    setAuthorizedUsers(newUsers);
                  }}
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                />
              </View>
            </View>
            
            <View style={styles.timeFieldsRow}>
              <View style={styles.timeFieldContainer}>
                <Text style={styles.fieldLabel}>Start Time</Text>
                <View style={styles.timeInputContainer}>
                  <Clock size={16} color="#777" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.timeInput}
                    value={user.startTime}
                    onChangeText={(text) => {
                      const newUsers = [...authorizedUsers];
                      newUsers[index].startTime = text.replace(/\D/g, '');
                      setAuthorizedUsers(newUsers);
                    }}
                    placeholder="YYMMDDHHMM"
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>
              
              <View style={styles.timeFieldContainer}>
                <Text style={styles.fieldLabel}>End Time</Text>
                <View style={styles.timeInputContainer}>
                  <Clock size={16} color="#777" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.timeInput}
                    value={user.endTime}
                    onChangeText={(text) => {
                      const newUsers = [...authorizedUsers];
                      newUsers[index].endTime = text.replace(/\D/g, '');
                      setAuthorizedUsers(newUsers);
                    }}
                    placeholder="YYMMDDHHMM"
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
              </View>
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => addAuthorizedUser(index)}
              >
                <UserPlus size={16} color="white" />
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => deleteAuthorizedUser(index)}
              >
                <UserMinus size={16} color="white" />
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.commandPreviewContainer}>
              <Text style={styles.commandPreviewLabel}>Command Preview:</Text>
              <Text style={styles.commandPreview}>
                {password}A{user.serial}#{user.phone || "xxxxxxxxxx"}#
                {user.startTime && user.endTime ? `${user.startTime}#${user.endTime}#` : ""}
              </Text>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveToLocalStorage}
        >
          <Save size={18} color="white" />
          <Text style={styles.saveButtonText}>Save All Users</Text>
        </TouchableOpacity>
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
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userCardHeader: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  fieldContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  serialInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  serialPrefix: {
    paddingLeft: 10,
    color: '#777',
    fontSize: 16,
  },
  serialInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
  },
  fieldIcon: {
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  timeFieldsRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  timeFieldContainer: {
    flex: 1,
    marginRight: 8,
  },
  timeFieldContainer: {
    flex: 1,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
  },
  timeInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  timeFieldContainer: {
    flex: 1,
    marginRight: 6,
  },
  timeFieldContainer: {
    flex: 1,
    marginLeft: 6,
    marginRight: 0,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#f44336',
    borderRadius: 4,
    padding: 8,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  commandPreviewContainer: {
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  commandPreviewLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  commandPreview: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  saveButton: {
    backgroundColor: '#3a86ff',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  }
});