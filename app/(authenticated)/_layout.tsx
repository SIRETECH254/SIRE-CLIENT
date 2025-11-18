import { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthenticatedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#7b1c1c" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(public)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="projects/index" options={{ headerShown: false }} />
      <Stack.Screen name="projects/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="invoices/index" options={{ headerShown: false }} />
      <Stack.Screen name="invoices/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="quotations/index" options={{ headerShown: false }} />
      <Stack.Screen name="quotations/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="payments/index" options={{ headerShown: false }} />
      <Stack.Screen name="payments/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="payments/initiate" options={{ headerShown: false }} />
      <Stack.Screen name="testimonials/index" options={{ headerShown: false }} />
      <Stack.Screen name="notifications/index" options={{ headerShown: false }} />
      <Stack.Screen name="notifications/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile/index" options={{ headerShown: false }} />
      <Stack.Screen name="profile/change-password" options={{ headerShown: false }} />
    </Stack>
  );
}

