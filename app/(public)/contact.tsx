import { View, Text, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ContactPage() {
  return (
    <ScrollView className="flex-1 bg-white">
      <ThemedView className="px-6 py-12">
        <ThemedText type="title" className="text-3xl font-poppins font-bold text-brand-primary mb-4">
          Contact Us
        </ThemedText>
        <ThemedText className="text-base font-inter text-gray-600">
          Contact page placeholder - Coming soon
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

