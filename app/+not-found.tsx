import { View, Text, TouchableOpacity } from 'react-native';
import { Link, Stack } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <View className="flex-1 items-center justify-center bg-white px-4">
        <Text className="text-4xl font-poppins font-bold text-brand-primary mb-4">
          404
        </Text>
        <Text className="text-xl font-poppins font-semibold text-black mb-2">
          Page Not Found
        </Text>
        <Text className="text-base font-inter text-gray-600 text-center mb-6">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Link href="/(public)" asChild>
          <TouchableOpacity className="bg-brand-primary px-6 py-3 rounded-xl">
            <Text className="text-white font-inter font-semibold text-base">
              Go to Home
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

