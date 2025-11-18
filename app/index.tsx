import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function RootIndex() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7b1c1c" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(authenticated)" />;
  }

  return <Redirect href="/(public)" />;
}

