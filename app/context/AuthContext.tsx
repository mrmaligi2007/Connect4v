import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Google from 'expo-auth-session/providers/google';
import { Alert } from 'react-native';
import Constants from 'expo-constants';

// Create a properly typed context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  // Load the client ID from app.json extra field
  const clientId = Constants.expoConfig?.extra?.googleClientId || 'MISSING_CLIENT_ID';

  // Add console output to help with debugging
  console.log("Google Auth Configuration:", {
    clientId: clientId.substring(0, 10) + '...',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: clientId,
    androidClientId: clientId,
    webClientId: clientId,
    // Add proper scopes for Drive API
    scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file']
  });

  // Check for any stored credentials on mount
  useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('google_access_token');
        const storedUser = await SecureStore.getItemAsync('google_user');

        if (storedToken && storedUser) {
          setState({
            user: JSON.parse(storedUser),
            accessToken: storedToken,
            isLoading: false,
          });
        } else {
          setState({ ...state, isLoading: false });
        }
      } catch (error) {
        console.error('Error loading stored credentials:', error);
        setState({ ...state, isLoading: false });
      }
    };

    loadStoredCredentials();
  }, []);

  // Handle auth response
  useEffect(() => {
    if (response?.type === 'success') {
      console.log("Auth response success!");
      const { authentication } = response;
      handleGoogleSignIn(authentication.accessToken);
    } else if (response?.type === 'error') {
      console.error("Auth response error:", response.error);
      Alert.alert('Authentication Error', 'Failed to sign in with Google.');
      setState({ ...state, isLoading: false });
    }
  }, [response]);

  const handleGoogleSignIn = async (accessToken) => {
    try {
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const userInfo = await userInfoResponse.json();
      await SecureStore.setItemAsync('google_access_token', accessToken);
      await SecureStore.setItemAsync('google_user', JSON.stringify(userInfo));
      setState({
        user: userInfo,
        accessToken,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error during authentication:', error);
      Alert.alert('Authentication Error', 'Failed to sign in. Please try again.');
      setState({ ...state, isLoading: false });
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('google_access_token');
      await SecureStore.deleteItemAsync('google_user');
      setState({
        user: null,
        accessToken: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...state, 
      signIn: () => {
        console.log("Attempting Google Sign In");
        setState({ ...state, isLoading: true });
        return promptAsync();
      }, 
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
