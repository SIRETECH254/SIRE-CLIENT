import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { useChangePassword } from '@/tanstack/useUsers';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ChangePasswordPage() {
  const router = useRouter();
  const changePassword = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [inlineStatus, setInlineStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleSubmit = useCallback(async () => {
    setInlineStatus(null);
    setValidationErrors([]);

    const errors: string[] = [];

    if (!currentPassword.trim()) {
      errors.push('Current password is required');
    }

    if (!newPassword.trim()) {
      errors.push('New password is required');
    } else if (newPassword.length < 6) {
      errors.push('New password must be at least 6 characters');
    }

    if (!confirmPassword.trim()) {
      errors.push('Confirm password is required');
    } else if (newPassword !== confirmPassword) {
      errors.push('New password and confirm password do not match');
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      errors.push('New password must be different from current password');
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setInlineStatus({ type: 'error', message: errors[0] });
      return;
    }

    try {
      const result = await changePassword.mutateAsync({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      if (result?.success) {
        setInlineStatus({ type: 'success', message: 'Password changed successfully' });

        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');

        // Navigate back after a short delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        setInlineStatus({ type: 'error', message: 'Failed to change password' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setInlineStatus({ type: 'error', message: errorMessage });
    }
  }, [currentPassword, newPassword, confirmPassword, changePassword, router]);

  const isBusy = changePassword.isPending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <ThemedView className="px-6 py-8">
          <ThemedText type="title" className="text-2xl font-poppins font-bold text-black mb-6">
            Change Password
          </ThemedText>

          {/* Form Fields */}
          <View className="space-y-4 mb-6">
            <View>
              <Text className="form-label">Current Password *</Text>
              <View className="relative">
                <TextInput
                  value={currentPassword}
                  onChangeText={(value) => {
                    setCurrentPassword(value);
                    setInlineStatus(null);
                  }}
                  placeholder="Enter current password"
                  secureTextEntry={!isCurrentPasswordVisible}
                  className="form-input pr-12"
                  editable={!isBusy}
                />
                <Pressable
                  onPress={() => setIsCurrentPasswordVisible((prev) => !prev)}
                  className="absolute right-3 top-3.5">
                  <MaterialIcons
                    name={isCurrentPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#7b1c1c"
                  />
                </Pressable>
              </View>
            </View>

            <View>
              <Text className="form-label">New Password *</Text>
              <View className="relative">
                <TextInput
                  value={newPassword}
                  onChangeText={(value) => {
                    setNewPassword(value);
                    setInlineStatus(null);
                  }}
                  placeholder="Enter new password (min. 6 characters)"
                  secureTextEntry={!isNewPasswordVisible}
                  className="form-input pr-12"
                  editable={!isBusy}
                />
                <Pressable
                  onPress={() => setIsNewPasswordVisible((prev) => !prev)}
                  className="absolute right-3 top-3.5">
                  <MaterialIcons
                    name={isNewPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#7b1c1c"
                  />
                </Pressable>
              </View>
              <Text className="text-xs font-inter text-gray-500 mt-1">
                Must be at least 6 characters
              </Text>
            </View>

            <View>
              <Text className="form-label">Confirm New Password *</Text>
              <View className="relative">
                <TextInput
                  value={confirmPassword}
                  onChangeText={(value) => {
                    setConfirmPassword(value);
                    setInlineStatus(null);
                  }}
                  placeholder="Confirm new password"
                  secureTextEntry={!isConfirmPasswordVisible}
                  className="form-input pr-12"
                  editable={!isBusy}
                />
                <Pressable
                  onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
                  className="absolute right-3 top-3.5">
                  <MaterialIcons
                    name={isConfirmPasswordVisible ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#7b1c1c"
                  />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <View className="mb-4">
              {validationErrors.map((error, index) => (
                <Text key={index} className="form-message-error mb-1">
                  {error}
                </Text>
              ))}
            </View>
          )}

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
                <Text className="btn-text btn-text-primary">Change Password</Text>
              )}
            </Pressable>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
