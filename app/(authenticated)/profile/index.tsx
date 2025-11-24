import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGetProfile } from '@/tanstack/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, error } = useGetProfile();

  const client = data?.data?.user || user;

  // Generate initials fallback
  const initials = useMemo(() => {
    if (!client) return 'U';
    const first = client.firstName?.[0]?.toUpperCase() || '';
    const last = client.lastName?.[0]?.toUpperCase() || '';
    return first + last || 'U';
  }, [client]);

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#7b1c1c" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView className="flex-1 items-center justify-center px-6">
        <Text className="form-message-error">
          {error instanceof Error ? error.message : 'Failed to load profile'}
        </Text>
      </ThemedView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <ThemedView className="px-6 py-8">
        {/* Header Section */}
        <View className="items-center mb-8">
          {client?.avatar ? (
            <Image
              source={{ uri: client.avatar }}
              className="w-24 h-24 rounded-full mb-4"
              resizeMode="cover"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-brand-primary items-center justify-center mb-4">
              <Text className="text-white text-2xl font-poppins font-bold">
                {initials}
              </Text>
            </View>
          )}
          <ThemedText type="title" className="text-2xl font-poppins font-bold text-black mb-1">
            {client?.firstName} {client?.lastName}
          </ThemedText>
          <ThemedText className="text-base font-inter text-gray-600 mb-1">
            {client?.email}
          </ThemedText>
          {client?.phone && (
            <ThemedText className="text-base font-inter text-gray-600">
              {client.phone}
            </ThemedText>
          )}
        </View>

        {/* Contact Information Card */}
        <View className="bg-gray-50 rounded-xl p-6 mb-6">
          <ThemedText type="subtitle" className="text-lg font-poppins font-semibold text-black mb-4">
            Contact Information
          </ThemedText>
          <View className="space-y-3">
            <View>
              <Text className="form-label">Email</Text>
              <Text className="text-base font-inter text-gray-900 mt-1">
                {client?.email || 'N/A'}
              </Text>
            </View>
            {client?.phone && (
              <View>
                <Text className="form-label">Phone</Text>
                <Text className="text-base font-inter text-gray-900 mt-1">
                  {client.phone}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Account Information Card */}
        <View className="bg-gray-50 rounded-xl p-6 mb-6">
          <ThemedText type="subtitle" className="text-lg font-poppins font-semibold text-black mb-4">
            Account Information
          </ThemedText>
          <View className="space-y-3">
            <View>
              <Text className="form-label">Email Verified</Text>
              <View className="flex-row items-center mt-1">
                <View className={`w-2 h-2 rounded-full mr-2 ${client?.emailVerified ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <Text className="text-base font-inter text-gray-900">
                  {client?.emailVerified ? 'Verified' : 'Not Verified'}
                </Text>
              </View>
            </View>
            {client?.createdAt && (
              <View>
                <Text className="form-label">Member Since</Text>
                <Text className="text-base font-inter text-gray-900 mt-1">
                  {formatDate(client.createdAt)}
                </Text>
              </View>
            )}
            {client?.updatedAt && (
              <View>
                <Text className="form-label">Last Updated</Text>
                <Text className="text-base font-inter text-gray-900 mt-1">
                  {formatDate(client.updatedAt)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-4">
          <Pressable
            onPress={() => router.push('/(authenticated)/profile/edit')}
            className="btn btn-primary">
            <Text className="btn-text btn-text-primary">Edit Profile</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(authenticated)/profile/change-password')}
            className="btn btn-secondary">
            <Text className="btn-text btn-text-secondary">Change Password</Text>
          </Pressable>
        </View>
      </ThemedView>
    </ScrollView>
  );
}
