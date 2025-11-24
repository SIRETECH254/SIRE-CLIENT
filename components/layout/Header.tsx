import { useMemo, useState } from 'react';
import { Image, Pressable, Text, View, type GestureResponderEvent } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, usePathname, useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';
import { useThemeToggle } from '@/hooks/use-theme-toggle';
import { PUBLIC_NAV_ITEMS } from '@/constants/navigation';

/**
 * Header Component Props
 * @param onToggleSidebar - Function to toggle sidebar visibility (mobile)
 * @param isSidebarOpen - Boolean indicating if sidebar is currently open
 */
type HeaderProps = {
  onToggleSidebar: (event?: GestureResponderEvent) => void;
  isSidebarOpen: boolean;
};

/**
 * Header Component
 * 
 * Main navigation header for the client application. Displays:
 * - Logo and app name
 * - Mobile sidebar toggle button
 * - Navigation links (visible on large screens)
 * - Login button (when not authenticated)
 * - User avatar/initials with dropdown menu (when authenticated)
 */
export function Header({ onToggleSidebar, isSidebarOpen }: HeaderProps) {
  // Auth context - provides user data and logout function
  const { user, logout } = useAuth();
  
  // State for user menu dropdown visibility
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Router hooks for navigation and current path
  const pathname = usePathname();
  const router = useRouter();
  
  // Theme hook for dark/light mode
  const { colorScheme } = useThemeToggle();

  /**
   * Determine active navigation label based on current pathname
   * Finds matching nav item from PUBLIC_NAV_ITEMS and returns its label
   * Falls back to 'Home' if no match found
   */
  const activeNav = useMemo(() => {
    const normalize = (p: string) =>
      (p || '')
        .replace(/\/\([^/]+\)/g, '') // strip any "(group)" segment
        .replace(/\/+$/, ''); // strip trailing slash
    const currentPath = normalize(pathname || '');
    const match = PUBLIC_NAV_ITEMS.find((item) => {
      const targetPath = normalize(String(item.href));
      // Home route: only match when current path is exactly empty or '/'
      if (targetPath === '' || targetPath === '/') {
        return currentPath === '' || currentPath === '/';
      }
      // Other routes: exact match or starts with target path followed by '/'
      return currentPath === targetPath || currentPath.startsWith(targetPath + '/');
    });
    return match?.label ?? 'Home';
  }, [pathname]);

  /**
   * Generate user initials from first and last name
   * Returns first letter of each name, or 'U' as fallback
   */
  const userInitials = useMemo(() => {
    if (!user) return 'U';
    const initials = [user.firstName, user.lastName]
      .filter(Boolean)
      .map((value) => value?.[0]?.toUpperCase())
      .join('');
    return initials || 'U';
  }, [user]);

  /**
   * Extract and validate user avatar URL
   * Returns null if avatar is missing or invalid
   */
  const userAvatar = useMemo(() => {
    const avatar = user?.avatar;
    if (typeof avatar === 'string' && avatar.trim().length > 0) {
      return avatar.trim();
    }
    return null;
  }, [user?.avatar]);

  /**
   * Handle logout action
   * Closes menu dropdown and calls logout function from auth context
   */
  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
  };

  /**
   * Handle profile navigation
   * Closes menu dropdown and navigates to profile page
   */
  const handleProfile = () => {
    setIsMenuOpen(false);
    router.push('/(authenticated)/profile/index');
  };

  /**
   * Handle login navigation
   * Navigates to login page
   */
  const handleLogin = () => {
    router.push('/(public)/login');
  };

  return (
    <>
      {/* Full-screen overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <Pressable
          onPress={() => setIsMenuOpen(false)}
          className="absolute inset-0 z-30"
          accessibilityElementsHidden
        />
      )}
      <View className="relative z-20 flex-row items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      {/* Left Section: Mobile Menu Toggle + Logo */}
      <View className="flex-row items-center gap-3">
        {/* Mobile Sidebar Toggle Button - Only visible on small screens (lg:hidden) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
          className="lg:hidden rounded-full p-2 bg-gray-100 dark:bg-gray-800"
          onPress={onToggleSidebar}>
          <MaterialIcons
            name={isSidebarOpen ? 'close' : 'menu'}
            size={22}
            color={colorScheme === 'dark' ? '#ffffff' : '#111827'}
          />
        </Pressable>
        
        {/* App Logo and Name */}
        <View className="flex-row items-center gap-2">
          <Image
            source={require('@/assets/images/icon.png')}
            resizeMode="contain"
            style={{ height: 32, width: 32, borderRadius: 8 }}
          />
          <Text className="font-poppins text-xl font-semibold text-brand-primary">
            SIRE TECH
          </Text>
        </View>
      </View>

      {/* Center Section: Navigation Links - Only visible on large screens (hidden lg:flex) */}
      <View className="hidden flex-1 flex-row items-center justify-center gap-6 lg:flex">
        {PUBLIC_NAV_ITEMS.map((item) => {
          const normalize = (p: string) =>
            (p || '')
              .replace(/\/\([^/]+\)/g, '')
              .replace(/\/+$/, '');
          const currentPath = normalize(pathname || '');
          const targetPath = normalize(String(item.href));
          
          // Determine if this link is active
          let isActive = false;
          if (targetPath === '' || targetPath === '/') {
            // Home route: only active when current path is exactly empty or '/'
            isActive = currentPath === '' || currentPath === '/';
          } else {
            // Other routes: exact match or starts with target path followed by '/'
            isActive = currentPath === targetPath || currentPath.startsWith(targetPath + '/');
          }
          
          return (
            <Link key={item.href} href={item.href} asChild>
              <Pressable
                accessibilityRole="button"
                className={`px-3 py-2 rounded-lg ${
                  isActive
                    ? 'bg-brand-tint'
                    : 'bg-transparent'
                }`}>
                <Text
                  className={`font-inter text-sm ${
                    isActive
                      ? 'text-brand-primary font-semibold'
                      : 'text-gray-700 dark:text-gray-200'
                  }`}>
                  {item.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>

      {/* Right Section: Login Button or User Menu */}
      <View className="flex-row items-center gap-4">
        {!user ? (
          /* Login Button - When not authenticated */
          <Pressable
            onPress={handleLogin}
            accessibilityRole="button"
            className="bg-brand-primary px-4 py-2 rounded-xl">
            <Text className="text-white font-inter font-semibold text-base">
              Login
            </Text>
          </Pressable>
        ) : (
          /* User Avatar/Initials with Dropdown Menu - When authenticated */
          <View className="relative">
            {/* Avatar Button - Toggles menu dropdown */}
            <Pressable
              onPress={() => setIsMenuOpen((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel="Account menu"
              className={`h-10 w-10 overflow-hidden rounded-full ${userAvatar ? '' : 'items-center justify-center bg-brand-primary'}`}>
              {/* Show user avatar image if available */}
              {userAvatar ? (
                <Image
                  source={{ uri: userAvatar }}
                  resizeMode="cover"
                  style={{ height: 40, width: 40 }}
                />
              ) : (
                /* Fallback to user initials if no avatar */
                <Text className="font-inter text-base font-semibold text-white">
                  {userInitials}
                </Text>
              )}
            </Pressable>
            
            {/* Dropdown Menu - Shown when isMenuOpen is true */}
            {isMenuOpen && (
              <View className="absolute right-0 z-40 mt-3 w-56 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                {/* User Name */}
                <Text className="font-poppins text-lg font-semibold text-brand-primary">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                </Text>
                {/* User Email */}
                <Text className="mt-1 font-inter text-sm text-gray-600 dark:text-gray-300">
                  {user?.email ?? 'No email available'}
                </Text>
                
                {/* Menu Actions */}
                <View className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
                  {/* View Profile Button */}
                  <Pressable
                    onPress={handleProfile}
                    className="flex-row items-center gap-2 rounded-lg px-2 py-2 hover:bg-brand-tint dark:hover:bg-gray-800">
                    <MaterialIcons
                      name="manage-accounts"
                      size={20}
                      color={colorScheme === 'dark' ? '#f3f4f6' : '#111827'}
                    />
                    <Text className="font-inter text-sm text-gray-700 dark:text-gray-200">
                      View Profile
                    </Text>
                  </Pressable>
                  
                  {/* Logout Button */}
                  <Pressable
                    onPress={handleLogout}
                    className="mt-2 flex-row items-center gap-2 rounded-lg px-2 py-2 hover:bg-brand-tint dark:hover:bg-gray-800">
                    <MaterialIcons name="logout" size={20} color="#a33c3c" />
                    <Text className="font-inter text-sm text-brand-accent">Logout</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
    </>
  );
}

