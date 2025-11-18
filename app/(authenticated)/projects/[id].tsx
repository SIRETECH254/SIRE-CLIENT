import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProjectDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView className="flex-1 items-center justify-center px-6">
      <ThemedText type="title" className="text-3xl font-poppins font-bold text-brand-primary mb-4">
        Project Details
      </ThemedText>
      <ThemedText className="text-base font-inter text-gray-600 mb-2">
        Project detail page placeholder - Coming soon
      </ThemedText>
      <ThemedText className="text-sm font-inter text-gray-500">
        Project ID: {id}
      </ThemedText>
    </ThemedView>
  );
}

