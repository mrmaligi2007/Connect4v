import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
}

export default function Header({ title, showBack = false, backTo = '/(tabs)/setup' }: HeaderProps) {
  const router = useRouter();
  
  return (
    <View style={styles.header}>
      {showBack && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push(backTo)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft color="white" size={24} />
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingTop: 50,
    backgroundColor: '#3a86ff',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
});