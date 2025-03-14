import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { ChevronLeft, User, Phone, Clock, UserX } from 'lucide-react-native';

export default function AuthorizedUsersList() {
  const router = useRouter();
  const [authorizedUsers, setAuthorizedUsers] = useState([]);

  const loadAuthorizedUsers = async () => {
    try {
      const savedUsers = await AsyncStorage.getItem('authorizedUsers');
      if (savedUsers) {
        setAuthorizedUsers(JSON.parse(savedUsers).filter(user => user.phone));
      }
    } catch (error) {
      console.error('Error loading authorized users', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadAuthorizedUsers();
    }, [])
  );

  const formatTimeDisplay = (time) => {
    if (!time || time.length !== 10) return 'Not set';
    
    // Format YYMMDDHHMM to YY/MM/DD HH:MM
    const year = time.slice(0, 2);
    const month = time.slice(2, 4);
    const day = time.slice(4, 6);
    const hour = time.slice(6, 8);
    const minute = time.slice(8, 10);
    
    return `20${year}/${month}/${day} ${hour}:${minute}`;
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
        <Text style={styles.headerTitle}>Authorized Users</Text>
        <View style={styles.placeholder}></View>
      </View>
      
      <ScrollView style={styles.content}>
        {authorizedUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <UserX size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No authorized users found</Text>
            <Text style={styles.emptyStateHint}>
              Add users from the Authorized Users screen
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.listTitle}>
              {authorizedUsers.length} {authorizedUsers.length === 1 ? 'User' : 'Users'}
            </Text>
            
            {authorizedUsers.map((user, index) => (
              <View key={index} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userIcon}>
                    <User size={16} color="white" />
                  </View>
                  <Text style={styles.userTitle}>User {user.serial}</Text>
                </View>
                
                <View style={styles.userDetail}>
                  <Phone size={16} color="#777" />
                  <Text style={styles.userDetailText}>{user.phone || 'N/A'}</Text>
                </View>
                
                {(user.startTime || user.endTime) && (
                  <View style={styles.userDetail}>
                    <Clock size={16} color="#777" />
                    <Text style={styles.userDetailText}>
                      {user.startTime ? formatTimeDisplay(user.startTime) : 'Not set'} to {user.endTime ? formatTimeDisplay(user.endTime) : 'Not set'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </>
        )}
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
  listTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#333',
    marginTop: 16,
    fontWeight: '500',
  },
  emptyStateHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3a86ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userDetailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
});
