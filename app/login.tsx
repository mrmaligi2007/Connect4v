import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './context/AuthContext';

export default function LoginScreen() {
  const { signIn, user, isLoading } = useAuth();
  const router = useRouter();

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (user && !isLoading) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, router]);

  const handleSignIn = async () => {
    try {
      console.log("Starting Google sign in process");
      await signIn();
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Connect4v</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>Welcome to Connect4v</Text>
        <Text style={styles.subtitle}>Sign in to backup and sync your device settings</Text>
        
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#333" style={styles.googleIcon} />
          ) : (
            <Image 
              source={require('../assets/images/google-logo.png')} 
              style={styles.googleIcon} 
            />
          )}
          <Text style={styles.googleButtonText}>
            {isLoading ? 'Loading...' : 'Sign in with Google'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.skipButtonText}>Skip Sign In</Text>
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
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    width: '100%',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    padding: 12,
    marginTop: 12,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
