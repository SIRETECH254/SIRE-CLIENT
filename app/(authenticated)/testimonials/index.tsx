import { View, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function TestimonialsPage() {
  return (
    <ThemedView className="flex-1 items-center justify-center px-6">
      <ThemedText type="title" className="text-3xl font-poppins font-bold text-brand-primary mb-4">
        Testimonials
      </ThemedText>
      <ThemedText className="text-base font-inter text-gray-600">
        Testimonials page placeholder - Coming soon
      </ThemedText>
    </ThemedView>
  );
}

