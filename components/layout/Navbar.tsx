import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { BrandColors } from '@/constants/theme';

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogin = () => {
    router.push('/(public)/login');
  };

  const handleProfile = () => {
    router.push('/(authenticated)/profile');
  };

  const handleLogout = async () => {
    await logout();
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  return (
    <View className="w-full bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
      {/* Logo/Brand */}
      <View className="flex-row items-center">
        <Text className="text-2xl font-poppins font-bold text-brand-primary">
          SIRE TECH
        </Text>
      </View>

      {/* Right side: Login button or Avatar */}
      <View className="flex-row items-center gap-4">
        {!isAuthenticated ? (
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-brand-primary px-4 py-2 rounded-xl">
            <Text className="text-white font-inter font-semibold text-base">
              Login
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center gap-3">
            {/* Avatar */}
            <TouchableOpacity
              onPress={handleProfile}
              className="w-10 h-10 rounded-full bg-brand-primary items-center justify-center">
              {user?.avatar ? (
                <Image
                  source={{ uri: user.avatar }}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <Text className="text-white font-inter font-semibold text-sm">
                  {getUserInitials()}
                </Text>
              )}
            </TouchableOpacity>

            {/* Logout button */}
            <TouchableOpacity
              onPress={handleLogout}
              className="px-3 py-2 border border-gray-300 rounded-xl">
              <Text className="text-gray-700 font-inter font-semibold text-sm">
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

