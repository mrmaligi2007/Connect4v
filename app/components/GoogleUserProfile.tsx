import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export default function GoogleUserProfile() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {user.picture && (
          <Image 
            source={{ uri: user.picture }} 
            style={styles.profileImage} 
          />
        )}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user.email || ''}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <LogOut size={16} color="#fff" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#f44336',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  signOutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});
