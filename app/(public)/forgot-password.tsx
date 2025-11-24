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
import { useRouter } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

interface InlineMessage {
  type: 'error' | 'success';
  text: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [inlineMessage, setInlineMessage] = useState<InlineMessage | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback(() => {
    if (error) {
      clearError();
    }
    setInlineMessage(null);
  }, [error, clearError]);

  const handleSubmit = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setInlineMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setInlineMessage(null);
    setIsSubmitting(true);

    try {
      const result = await forgotPassword(trimmedEmail);
      if (!result.success) {
        setInlineMessage({ type: 'error', text: result.error ?? 'Unable to send reset link' });
        return;
      }

      setInlineMessage({
        type: 'success',
        text: 'Check your inbox for password reset instructions.',
      });
    } catch {
      setInlineMessage({ type: 'error', text: 'Unexpected error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [email, forgotPassword]);

  const handleBackToLogin = useCallback(() => {
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
                  Forgot password?
                </Text>
                <Text className="text-center text-base text-gray-600">
                  Enter your email address and we&apos;ll send you instructions to reset your password.
                </Text>
              </View>

              <View className="space-y-5">
                <View className="w-full space-y-2">
                  <Text className="form-label">Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={(value) => {
                      setEmail(value);
                      handleInputChange();
                    }}
                    autoCapitalize="none"
                    autoComplete="email"
                    keyboardType="email-address"
                    placeholder="client@example.com"
                    className="form-input"
                  />
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
                      Send reset instructions
                    </Text>
                  )}
                </Pressable>
              </View>

              <View className="flex-row justify-center">
                <Pressable onPress={handleBackToLogin}>
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
