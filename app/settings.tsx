import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from './components/Header';
import { Save, DownloadCloud, UploadCloud, LogIn } from 'lucide-react-native';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'expo-router';

export default function SettingsPage() {
  const [unitNumber, setUnitNumber] = useState('');
  const [password, setPassword] = useState('1234');
  const [relaySettings, setRelaySettings] = useState({
    accessControl: 'AUT',
    latchTime: '000',
  });
  const { user, accessToken, signIn, signOut, backupToGoogleDrive, restoreFromGoogleDrive } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedUnitNumber = await AsyncStorage.getItem('unitNumber');
      const savedPassword = await AsyncStorage.getItem('password');
      const savedRelaySettings = await AsyncStorage.getItem('relaySettings');

      if (savedUnitNumber) setUnitNumber(savedUnitNumber);
      if (savedPassword) setPassword(savedPassword);
      if (savedRelaySettings) setRelaySettings(JSON.parse(savedRelaySettings));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveToLocalStorage = async () => {
    try {
      await AsyncStorage.setItem('unitNumber', unitNumber);
      await AsyncStorage.setItem('password', password);
      await AsyncStorage.setItem('relaySettings', JSON.stringify(relaySettings));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save settings');
    }
  };

  const handleBackup = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in with Google to backup your settings',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/login') }
        ]
      );
      return;
    }

    try {
      // Collect all app data
      const appData = {
        unitNumber,
        password,
        relaySettings,
        // Load additional data you want to backup
        authorizedUsers: JSON.parse(await AsyncStorage.getItem('authorizedUsers') || '[]'),
        timestamp: new Date().toISOString()
      };

      // Use the context function to backup to Google Drive
      const success = await backupToGoogleDrive(appData);
      
      if (success) {
        console.log('Backup completed successfully');
      }
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('Backup Error', 'Failed to backup your data. Please try again.');
    }
  };

  const handleRestore = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You need to sign in with Google to restore your settings',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/login') }
        ]
      );
      return;
    }

    try {
      // Confirm restore action
      Alert.alert(
        'Restore from Backup',
        'This will replace your current settings with the backup data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Restore', 
            onPress: async () => {
              const data = await restoreFromGoogleDrive();
              
              if (data) {
                // Update state and storage with restored data
                setUnitNumber(data.unitNumber);
                setPassword(data.password);
                setRelaySettings(data.relaySettings);
                
                await AsyncStorage.setItem('unitNumber', data.unitNumber);
                await AsyncStorage.setItem('password', data.password);
                await AsyncStorage.setItem('relaySettings', JSON.stringify(data.relaySettings));
                
                if (data.authorizedUsers) {
                  await AsyncStorage.setItem('authorizedUsers', JSON.stringify(data.authorizedUsers));
                }
                
                Alert.alert('Restore Complete', 'Your settings have been restored successfully');
              }
            } 
          }
        ]
      );
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Restore Error', 'Failed to restore your data. Please try again.');
    }
  };

  const handleSignIn = () => {
    console.log('Navigating to login page...');
    router.push('/login');  // Make sure this navigation works
  };

  return (
    <View style={styles.container}>
      <Header title="Settings" />
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Device Phone Number</Text>
            <TextInput
              style={styles.input}
              value={unitNumber}
              onChangeText={setUnitNumber}
              placeholder="Enter GSM relay number"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Device Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '').slice(0, 4);
                setPassword(filtered);
              }}
              placeholder="4-digit password"
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveToLocalStorage}
        >
          <Save size={18} color="white" />
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Google Account</Text>
          
          {!user ? (
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleSignIn}
            >
              <LogIn size={18} color="#333" />
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          ) : (
            <View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.signOutButton}
                onPress={signOut}
              >
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Backup & Restore</Text>
          <Text style={styles.description}>
            Backup your device settings and authorized users to Google Drive or restore from a previous backup.
          </Text>
          
          <View style={styles.backupButtonsContainer}>
            <TouchableOpacity 
              style={[styles.backupButton, !user && styles.buttonDisabled]}
              onPress={handleBackup}
              disabled={!user}
            >
              <UploadCloud size={18} color="white" />
              <Text style={styles.backupButtonText}>Backup to Drive</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.restoreButton, !user && styles.buttonDisabled]}
              onPress={handleRestore}
              disabled={!user}
            >
              <DownloadCloud size={18} color="white" />
              <Text style={styles.backupButtonText}>Restore from Drive</Text>
            </TouchableOpacity>
          </View>
          
          {!user && (
            <Text style={styles.signInNote}>
              Sign in with Google to enable backup and restore features
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#3a86ff',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    marginLeft: 8,
  },
  userInfo: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  backupButtonsContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  backupButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  restoreButton: {
    flex: 1,
    backgroundColor: '#ff9800',
    padding: 12,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  backupButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  signInNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});

