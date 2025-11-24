import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useGetProfile, useUpdateProfile } from '@/tanstack/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/redux/slices/authSlice';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { data } = useGetProfile();
  const updateProfile = useUpdateProfile();

  const client = data?.data?.user || user;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [inlineStatus, setInlineStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize form fields from profile data
  useEffect(() => {
    if (client) {
      setFirstName(client.firstName || '');
      setLastName(client.lastName || '');
      setPhone(client.phone || '');
      setAvatarUri(client.avatar || null);
    }
  }, [client]);

  // Generate initials fallback
  const initials = useMemo(() => {
    const first = firstName?.[0]?.toUpperCase() || '';
    const last = lastName?.[0]?.toUpperCase() || '';
    return first + last || 'U';
  }, [firstName, lastName]);

  const currentAvatar = avatarRemoved ? null : (avatarUri || client?.avatar);

  const handlePickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setAvatarUri(asset.uri);
        setAvatarFile({
          uri: asset.uri,
          name: asset.fileName || 'avatar.jpg',
          type: 'image/jpeg',
        });
        setAvatarRemoved(false);
        setInlineStatus(null);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      setInlineStatus({ type: 'error', message: 'Failed to pick image' });
    }
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarUri(null);
    setAvatarFile(null);
    setAvatarRemoved(true);
    setInlineStatus(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setInlineStatus({ type: 'error', message: 'First name and last name are required' });
      return;
    }

    setInlineStatus(null);

    try {
      let payload: any;

      if (avatarFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('firstName', firstName.trim());
        formData.append('lastName', lastName.trim());
        if (phone.trim()) {
          formData.append('phone', phone.trim());
        }

        // Handle file upload differently for web vs native
        if (Platform.OS === 'web') {
          // Web: fetch the blob first
          const response = await fetch(avatarFile.uri);
          const blob = await response.blob();
          formData.append('avatar', blob, avatarFile.name);
        } else {
          // Native: use the file directly
          formData.append('avatar', {
            uri: avatarFile.uri,
            name: avatarFile.name,
            type: avatarFile.type,
          } as any);
        }

        payload = formData;
      } else if (avatarRemoved) {
        // Send JSON with avatar: null
        payload = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
          avatar: null,
        };
      } else {
        // No avatar change, send JSON
        payload = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim() || undefined,
        };
      }

      const result = await updateProfile.mutateAsync(payload);

      if (result?.success && result?.data?.user) {
        // Update Redux store
        dispatch(updateUser(result.data.user));

        setInlineStatus({ type: 'success', message: 'Profile updated successfully' });

        // Navigate back after a short delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setInlineStatus({ type: 'error', message: 'Failed to update profile' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setInlineStatus({ type: 'error', message: errorMessage });
    }
  }, [firstName, lastName, phone, avatarFile, avatarRemoved, updateProfile, dispatch, router]);

  const isBusy = updateProfile.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <ThemedView className="px-6 py-8">
          <ThemedText type="title" className="text-2xl font-poppins font-bold text-black mb-6">
            Edit Profile
          </ThemedText>

          {/* Avatar Picker */}
          <View className="items-center mb-6">
            {currentAvatar ? (
              <Image
                source={{ uri: currentAvatar }}
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
            <Pressable
              onPress={handlePickImage}
              disabled={isBusy}
              className="btn btn-secondary mb-2">
              <Text className="btn-text btn-text-secondary">Change Avatar</Text>
            </Pressable>
            {currentAvatar && (
              <Pressable
                onPress={handleRemoveAvatar}
                disabled={isBusy}
                className="btn btn-ghost">
                <Text className="btn-text text-red-600">Remove Avatar</Text>
              </Pressable>
            )}
          </View>

          {/* Form Fields */}
          <View className="space-y-4 mb-6">
            <View>
              <Text className="form-label">First Name *</Text>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                className="form-input"
                editable={!isBusy}
              />
            </View>

            <View>
              <Text className="form-label">Last Name *</Text>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                className="form-input"
                editable={!isBusy}
              />
            </View>

            <View>
              <Text className="form-label">Phone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                className="form-input"
                editable={!isBusy}
              />
            </View>

            <View>
              <Text className="form-label">Email</Text>
              <TextInput
                value={client?.email || ''}
                placeholder="Email"
                className="form-input form-input-disabled"
                editable={false}
              />
              <Text className="text-xs font-inter text-gray-500 mt-1">
                Email cannot be changed
              </Text>
            </View>
          </View>

          {/* Status Messages */}
          {inlineStatus && (
            <View className="mb-4">
              <Text
                className={
                  inlineStatus.type === 'success'
                    ? 'form-message-success'
                    : 'form-message-error'
                }>
                {inlineStatus.message}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-4">
            <Pressable
              onPress={() => router.back()}
              disabled={isBusy}
              className="btn btn-secondary flex-1">
              <Text className="btn-text btn-text-secondary">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              disabled={isBusy}
              className="btn btn-primary flex-1">
              {isBusy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-text btn-text-primary">Save Changes</Text>
              )}
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

