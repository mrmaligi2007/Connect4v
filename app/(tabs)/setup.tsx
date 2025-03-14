import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight, User, Key, Users, Settings } from 'lucide-react-native';
import Header from '../components/Header';
import DeviceInfo from '../components/DeviceInfo';

export default function SetupPage() {
  const router = useRouter();
  const [unitNumber, setUnitNumber] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedUnitNumber = await AsyncStorage.getItem('unitNumber');
      if (savedUnitNumber) setUnitNumber(savedUnitNumber);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveToLocalStorage = async () => {
    try {
      await AsyncStorage.setItem('unitNumber', unitNumber);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save settings');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Setup</Text>
      </View>
      
      {unitNumber && (
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceInfoText}>{unitNumber}</Text>
        </View>
      )}
      
      <ScrollView style={styles.content}>
        <View style={styles.menuList}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/step1')}
          >
            <View style={styles.menuItemIcon}>
              <User size={20} color="#3a86ff" />
              <Text style={styles.menuItemNumber}>1</Text>
            </View>
            <Text style={styles.menuItemText}>Register Admin</Text>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/step2')}
          >
            <View style={styles.menuItemIcon}>
              <Key size={20} color="#3a86ff" />
              <Text style={styles.menuItemNumber}>2</Text>
            </View>
            <Text style={styles.menuItemText}>Change Password</Text>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/step3')}
          >
            <View style={styles.menuItemIcon}>
              <Users size={20} color="#3a86ff" />
              <Text style={styles.menuItemNumber}>3</Text>
            </View>
            <Text style={styles.menuItemText}>Authorized Users</Text>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/step4')}
          >
            <View style={styles.menuItemIcon}>
              <Settings size={20} color="#3a86ff" />
              <Text style={styles.menuItemNumber}>4</Text>
            </View>
            <Text style={styles.menuItemText}>Relay Settings</Text>
            <ChevronRight size={20} color="#ccc" />
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
    padding: 16,
  },
  menuList: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuItemNumber: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#3a86ff',
    width: 16,
    height: 16,
    borderRadius: 8,
    color: 'white',
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
  }
});