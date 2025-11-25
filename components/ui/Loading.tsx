import { View, Text, ActivityIndicator } from 'react-native';
import { BrandColors } from '@/constants/theme';

type LoadingProps = {
  fullScreen?: boolean;
  message?: string;
};

export function Loading({ fullScreen = false, message }: LoadingProps) {
  if (fullScreen) {
    return (
      <View className="absolute inset-0 z-50 flex-1 items-center justify-center bg-white/90">
        <ActivityIndicator size="large" color={BrandColors.primary} />
        {message && (
          <Text className="mt-4 font-inter text-base text-gray-700">{message}</Text>
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center p-6">
      <ActivityIndicator size="large" color={BrandColors.primary} />
      {message && (
        <Text className="mt-4 font-inter text-base text-gray-700">{message}</Text>
      )}
    </View>
  );
}

