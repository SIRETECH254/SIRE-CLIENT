import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

interface InlineMessage {
  type: 'error' | 'success';
  text: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { resetPassword, isLoading, error, clearError } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearInlineMessage = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);

  const handleSubmit = useCallback(async () => {
    if (!token) {
      setInlineMessage({ type: 'error', text: 'Reset link is missing or invalid.' });
      return;
    }

    if (!password || !confirmPassword) {
      setInlineMessage({ type: 'error', text: 'Enter and confirm your new password.' });
      return;
    }

    if (password !== confirmPassword) {
      setInlineMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsSubmitting(true);
    setInlineMessage(null);

    try {
      const result = await resetPassword(token, password);
      if (!result.success) {
        setInlineMessage({
          type: 'error',
          text: result.error ?? 'Unable to reset password.',
        });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Password updated! Redirecting to sign in…',
      });

      setTimeout(() => router.replace('/(public)/login'), 15000);
    } catch {
      setInlineMessage({
        type: 'error',
        text: 'Unexpected error. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [token, password, confirmPassword, resetPassword, router]);

  const handleNavigateToLogin = useCallback(() => {
    setInlineMessage(null);
    router.push('/(public)/login');
  }, [router]);

  const isBusy = isSubmitting || isLoading;
  const displayMessage = inlineMessage || (error ? { type: 'error' as const, text: error } : null);

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-center px-6 py-10">
            <View className="w-full max-w-md space-y-8">
              <View className="space-y-2">
                <Text className="text-center text-3xl font-bold text-gray-900">
                  Reset Password
                </Text>
                <Text className="text-center text-base text-gray-600">
                  Enter your new password below.
                </Text>
              </View>

              <View className="space-y-5">
                <View className="w-full space-y-2">
                  <Text className="form-label">New password</Text>
                  <View className="relative w-full">
                    <TextInput
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        clearInlineMessage();
                      }}
                      autoComplete="password"
                      textContentType="newPassword"
                      secureTextEntry={!isPasswordVisible}
                      placeholder="••••••••"
                      className="form-input pr-12"
                    />
                    <Pressable
                      onPress={() => setIsPasswordVisible((prev) => !prev)}
                      accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-3.5">
                      <MaterialIcons
                        name={isPasswordVisible ? 'visibility-off' : 'visibility'}
                        size={20}
                        color="#7b1c1c"
                      />
                    </Pressable>
                  </View>
                </View>

                <View className="w-full space-y-2">
                  <Text className="form-label">Confirm password</Text>
                  <View className="relative w-full">
                    <TextInput
                      value={confirmPassword}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        clearInlineMessage();
                      }}
                      autoComplete="password"
                      textContentType="password"
                      secureTextEntry={!isConfirmPasswordVisible}
                      placeholder="••••••••"
                      className="form-input pr-12"
                    />
                    <Pressable
                      onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
                      accessibilityLabel={
                        isConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'
                      }
                      className="absolute right-3 top-3.5">
                      <MaterialIcons
                        name={isConfirmPasswordVisible ? 'visibility-off' : 'visibility'}
                        size={20}
                        color="#7b1c1c"
                      />
                    </Pressable>
                  </View>
                </View>

                {displayMessage ? (
                  <Text
                    className={
                      displayMessage.type === 'success'
                        ? 'form-message-success'
                        : 'form-message-error'
                    }>
                    {displayMessage.text}
                  </Text>
                ) : null}

                <Pressable
                  onPress={handleSubmit}
                  disabled={isBusy}
                  className="btn btn-primary mt-2 w-full">
                  {isBusy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="btn-text btn-text-primary">
                      Reset Password
                    </Text>
                  )}
                </Pressable>
              </View>

              <View className="flex-row justify-center">
                <Pressable onPress={handleNavigateToLogin}>
                  <Text className="text-sm font-semibold text-brand-primary">
                    Back to sign in
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
