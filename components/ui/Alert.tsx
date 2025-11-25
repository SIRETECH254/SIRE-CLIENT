import { View, Text } from 'react-native';
import { BrandColors } from '@/constants/theme';

type AlertProps = {
  variant?: 'success' | 'error' | 'info';
  message: string;
  className?: string;
};

export function Alert({ variant = 'info', message, className = '' }: AlertProps) {
  const variantStyles = {
    success: 'bg-emerald-100 border-emerald-300',
    error: 'bg-red-100 border-red-300',
    info: 'bg-blue-100 border-blue-300',
  };

  const textStyles = {
    success: 'text-emerald-700',
    error: 'text-red-700',
    info: 'text-blue-700',
  };

  return (
    <View className={`rounded-lg border p-3 ${variantStyles[variant]} ${className}`}>
      <Text className={`font-inter text-sm ${textStyles[variant]}`}>{message}</Text>
    </View>
  );
}

