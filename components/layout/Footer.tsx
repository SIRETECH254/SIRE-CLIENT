import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BrandColors } from '@/constants/theme';

export function Footer() {
  const router = useRouter();

  const currentYear = new Date().getFullYear();

  const handleLink = (path: string) => {
    router.push(path as any);
  };

  return (
    <View className="w-full bg-gray-900 px-4 py-6">
      <View className="flex-row flex-wrap justify-between items-start mb-6">
        {/* Company Info */}
        <View className="mb-4 min-w-[200px]">
          <Text className="text-xl font-poppins font-bold text-white mb-2">
            SIRE TECH
          </Text>
          <Text className="text-gray-400 font-inter text-sm leading-5">
            Providing innovative technology solutions for your business needs.
          </Text>
        </View>

        {/* Quick Links */}
        <View className="mb-4 min-w-[150px]">
          <Text className="text-white font-poppins font-semibold text-base mb-3">
            Quick Links
          </Text>
          <TouchableOpacity
            onPress={() => handleLink('/(public)/services')}
            className="mb-2">
            <Text className="text-gray-400 font-inter text-sm">Services</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLink('/(public)/about')}
            className="mb-2">
            <Text className="text-gray-400 font-inter text-sm">About</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleLink('/(public)/contact')}
            className="mb-2">
            <Text className="text-gray-400 font-inter text-sm">Contact</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View className="mb-4 min-w-[200px]">
          <Text className="text-white font-poppins font-semibold text-base mb-3">
            Contact Us
          </Text>
          <Text className="text-gray-400 font-inter text-sm mb-1">
            Email: info@siretech.com
          </Text>
          <Text className="text-gray-400 font-inter text-sm">
            Phone: +254 700 000 000
          </Text>
        </View>
      </View>

      {/* Copyright */}
      <View className="border-t border-gray-800 pt-4">
        <Text className="text-gray-500 font-inter text-xs text-center">
          © {currentYear} SIRE TECH. All rights reserved.
        </Text>
      </View>
    </View>
  );
}

