import { View, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ScrollView className="flex-1 bg-white">
      <ThemedView className="px-6 py-12">
        <ThemedText type="title" className="text-3xl font-poppins font-bold text-brand-primary mb-4">
          Dashboard
        </ThemedText>
        {user && (
          <ThemedText className="text-lg font-inter text-gray-700 mb-4">
            Welcome, {user.firstName} {user.lastName}!
          </ThemedText>
        )}
        <ThemedText className="text-base font-inter text-gray-600">
          Dashboard page placeholder - Coming soon
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

