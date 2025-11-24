import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LandingPage() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white">
      <ThemedView className="px-6 py-12">
        {/* Hero Section */}
        <View className="mb-12">
          <ThemedText type="title" className="text-4xl font-poppins font-bold text-brand-primary mb-4">
            Welcome to SIRE TECH
          </ThemedText>
          <ThemedText className="text-lg font-inter text-gray-700 mb-6">
            Innovative technology solutions for your business needs.
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/(public)/login')}
            className="bg-brand-primary px-6 py-3 rounded-xl">
            <Text className="text-white font-inter font-semibold text-base">
              Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services Preview */}
        <View className="mb-12">
          <ThemedText type="subtitle" className="text-2xl font-poppins font-semibold text-black mb-4">
            Our Services
          </ThemedText>
          <ThemedText className="text-base font-inter text-gray-700 mb-4">
            We offer a wide range of technology solutions tailored to your business needs.
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push('/(public)/services')}
            className="bg-brand-soft px-4 py-2 rounded-lg self-start">
            <Text className="text-white font-inter font-semibold text-sm">
              View All Services
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => router.push('/(public)/about')}
            className="flex-1 bg-gray-50 px-4 py-3 rounded-xl">
            <Text className="text-center font-inter font-semibold text-base text-gray-700">
              About Us
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(public)/contact')}
            className="flex-1 bg-gray-50 px-4 py-3 rounded-xl">
            <Text className="text-center font-inter font-semibold text-base text-gray-700">
              Contact
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

