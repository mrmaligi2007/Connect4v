import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Linking, Platform, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, Users, Lock, Save, Clock, Check } from 'lucide-react-native';

export default function Step4Page() {
  const router = useRouter();
  const [unitNumber, setUnitNumber] = useState('');
  const [password, setPassword] = useState('1234');
  const [relaySettings, setRelaySettings] = useState({
    accessControl: 'AUT',
    latchTime: '000',
  });
  const [hasChanges, setHasChanges] = useState(false);

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

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const saveToLocalStorage = async () => {
    try {
      await AsyncStorage.setItem('relaySettings', JSON.stringify(relaySettings));
      setHasChanges(false);
      Alert.alert("Success", "Relay settings saved successfully");
    } catch (error) {
      console.error('Error saving data:', error);
      Alert.alert("Error", "Failed to save settings");
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

  // Relay Control Settings
  const setAccessControl = (type) => {
    if (relaySettings.accessControl !== type) {
      setRelaySettings(prev => ({ ...prev, accessControl: type }));
      setHasChanges(true);
    }
  };

  const updateLatchTime = (value) => {
    const newValue = Math.min(999, Math.max(0, parseInt(value) || 0));
    const formattedValue = newValue.toString().padStart(3, '0');
    
    if (formattedValue !== relaySettings.latchTime) {
      setRelaySettings(prev => ({ ...prev, latchTime: formattedValue }));
      setHasChanges(true);
    }
  };

  const saveAllSettings = () => {
    // Send access control command
    const accessControlCommand = relaySettings.accessControl === 'ALL' ? 
      `${password}ALL#` : `${password}AUT#`;
    sendSMS(accessControlCommand);
    
    // Send latch time command
    const latchTime = relaySettings.latchTime.padStart(3, '0');
    sendSMS(`${password}GOT${latchTime}#`);
    
    // Save to local storage
    saveToLocalStorage();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/setup')}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relay Settings</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Access Control</Text>
          <Text style={styles.sectionDescription}>
            Choose who is allowed to control the relay
          </Text>
          
          <View style={styles.optionsGrid}>
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                relaySettings.accessControl === 'ALL' && styles.optionButtonSelected
              ]}
              onPress={() => setAccessControl('ALL')}
            >
              <Users size={28} color={relaySettings.accessControl === 'ALL' ? '#3a86ff' : '#666'} />
              <Text style={[
                styles.optionText,
                relaySettings.accessControl === 'ALL' && styles.optionTextSelected
              ]}>Allow All Numbers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.optionButton, 
                relaySettings.accessControl === 'AUT' && styles.optionButtonSelected
              ]}
              onPress={() => setAccessControl('AUT')}
            >
              <Lock size={28} color={relaySettings.accessControl === 'AUT' ? '#3a86ff' : '#666'} />
              <Text style={[
                styles.optionText,
                relaySettings.accessControl === 'AUT' && styles.optionTextSelected
              ]}>Authorized Only</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Relay Latch Time</Text>
          <Text style={styles.sectionDescription}>
            How long the relay stays activated
          </Text>
          
          <View style={styles.inputContainer}>
            <View style={styles.latchTimeContainer}>
              <Clock size={18} color="#777" style={styles.latchTimeIcon} />
              <TextInput
                style={styles.latchTimeInput}
                value={String(parseInt(relaySettings.latchTime) || '0')}
                onChangeText={(text) => updateLatchTime(text)}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={styles.latchTimeUnit}>seconds</Text>
            </View>
            <Text style={styles.inputHint}>
              0 = Momentary (0.5s), 999 = Always ON until next call
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveAllButton, !hasChanges && styles.saveButtonDisabled]}
          onPress={saveAllSettings}
          disabled={!hasChanges}
        >
          <Save size={18} color="white" />
          <Text style={styles.saveButtonText}>Save & Apply Settings</Text>
          {hasChanges && <View style={styles.changeIndicator} />}
        </TouchableOpacity>

        <View style={styles.commandPreviewCard}>
          <Text style={styles.commandPreviewTitle}>Commands that will be sent:</Text>
          <View style={styles.commandPreviewItem}>
            <Text style={styles.commandPreviewLabel}>Access Control:</Text>
            <Text style={styles.commandPreview}>
              {password}{relaySettings.accessControl === 'ALL' ? 'ALL#' : 'AUT#'}
            </Text>
          </View>
          <View style={styles.commandPreviewItem}>
            <Text style={styles.commandPreviewLabel}>Latch Time:</Text>
            <Text style={styles.commandPreview}>
              {password}GOT{relaySettings.latchTime}#
            </Text>
          </View>
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '48%',
  },
  optionButtonSelected: {
    borderColor: '#3a86ff',
    backgroundColor: '#f0f7ff',
  },
  optionText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#555',
  },
  optionTextSelected: {
    color: '#3a86ff',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  latchTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  latchTimeIcon: {
    marginRight: 10,
  },
  latchTimeInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  latchTimeUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  saveAllButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    position: 'relative',
  },
  saveButtonDisabled: {
    backgroundColor: '#a0d3a3',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  changeIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff9800',
  },
  commandPreviewCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  commandPreviewTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  commandPreviewItem: {
    marginBottom: 8,
  },
  commandPreviewLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  commandPreview: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
