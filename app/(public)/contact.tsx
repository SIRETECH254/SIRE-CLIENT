import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Alert } from '@/components/ui/Alert';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSubmitContactMessage } from '@/tanstack/useContact';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  if (!phone.trim()) return true; // Optional field
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

interface FormErrors {
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
}

export default function ContactPage() {
  const router = useRouter();
  const submitMutation = useSubmitContactMessage();
  const { user, isAuthenticated } = useAuth();
  // Only fetch profile if user is authenticated
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({
    name: null,
    email: null,
    phone: null,
    subject: null,
    message: null,
  });
  const [inlineStatus, setInlineStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form fields when user is authenticated and profile is loaded
  useEffect(() => {
    if (isAuthenticated && profileData?.data?.user) {
      const profile = profileData.data.user;
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '';
      
      if (fullName) setName(fullName);
      if (profile.email) setEmail(profile.email);
      if (profile.phone) setPhone(profile.phone);
    }
  }, [isAuthenticated, profileData]);

  const handleInputChange = useCallback(
    (field: keyof FormErrors, value: string) => {
      switch (field) {
        case 'name':
          setName(value);
          if (errors.name) setErrors(prev => ({ ...prev, name: null }));
          break;
        case 'email':
          setEmail(value);
          if (errors.email) setErrors(prev => ({ ...prev, email: null }));
          break;
        case 'phone':
          setPhone(value);
          if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
          break;
        case 'subject':
          setSubject(value);
          if (errors.subject) setErrors(prev => ({ ...prev, subject: null }));
          break;
        case 'message':
          setMessage(value);
          if (errors.message) setErrors(prev => ({ ...prev, message: null }));
          break;
      }
      if (inlineStatus) setInlineStatus(null);
    },
    [errors, inlineStatus]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {
      name: null,
      email: null,
      phone: null,
      subject: null,
      message: null,
    };

    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate phone (optional)
    if (phone.trim() && !validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    } else if (phone.length > 20) {
      newErrors.phone = 'Phone number cannot exceed 20 characters';
    }

    // Validate subject
    if (!subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (subject.length > 200) {
      newErrors.subject = 'Subject cannot exceed 200 characters';
    }

    // Validate message
    if (!message.trim()) {
      newErrors.message = 'Message is required';
    } else if (message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    } else if (message.length > 2000) {
      newErrors.message = 'Message cannot exceed 2000 characters';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(err => !err);
  }, [name, email, phone, subject, message]);

  const resetForm = useCallback(() => {
    // Only reset subject and message, keep user info if authenticated
    setSubject('');
    setMessage('');
    setErrors({
      name: null,
      email: null,
      phone: null,
      subject: null,
      message: null,
    });
    setInlineStatus(null);
    
    // Re-populate user info if authenticated
    if (isAuthenticated && profileData?.data?.user) {
      const profile = profileData.data.user;
      const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || '';
      
      if (fullName) setName(fullName);
      if (profile.email) setEmail(profile.email);
      if (profile.phone) setPhone(profile.phone);
    } else {
      // Reset all fields if not authenticated
      setName('');
      setEmail('');
      setPhone('');
    }
  }, [isAuthenticated, profileData]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setInlineStatus(null);

    try {
      await submitMutation.mutateAsync({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });

      setInlineStatus('success');
      resetForm();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to submit message. Please try again.';
      setInlineStatus(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, email, phone, subject, message, validateForm, submitMutation, resetForm]);

  const messageLength = message.length;
  const messageMinLength = 10;
  const messageMaxLength = 2000;
  const isMessageValid = messageLength >= messageMinLength && messageLength <= messageMaxLength;
  const isMessageTooShort = messageLength > 0 && messageLength < messageMinLength;
  const isMessageTooLong = messageLength > messageMaxLength;
  const mapEmbedUrl =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3697.8352276203846!2d36.71497717460087!3d-1.3709677986160578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f05e501aa7cff%3A0xb99d9f763ec7127c!2sOlolua%20Ridge%20Apartments!5e1!3m2!1sen!2ske!4v1768807784410!5m2!1sen!2ske';
  const socialLinks = [
    { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com/your-page' },
    { label: 'Twitter', icon: 'twitter', url: 'https://x.com/your-handle' },
    { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com/your-handle' },
    { label: 'LinkedIn', icon: 'linkedin', url: 'https://linkedin.com/company/your-company' },
    { label: 'YouTube', icon: 'youtube-play', url: 'https://youtube.com/@your-channel' },
  ] as const;

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-6 py-8">
            <View className="mx-auto w-full max-w-6xl">
              {/* Header Section */}
              <View className="mb-8 space-y-2">
                <View className="flex-row items-center justify-between">
                  <ThemedText
                    type="title"
                    className="text-3xl font-poppins font-bold text-brand-primary">
                    Contact Us
                  </ThemedText>
                  {isAuthenticated && (
                    <Pressable
                      onPress={() => router.push('/(authenticated)/contact/messages')}
                      className="btn btn-secondary flex-row items-center gap-2">
                      <MaterialIcons name="inbox" size={20} color="#374151" />
                      <Text className="btn-text btn-text-secondary">View Messages</Text>
                    </Pressable>
                  )}
                </View>
                <ThemedText className="text-base font-inter text-gray-600 dark:text-gray-400">
                  Have a question or need assistance? Fill out the form below and we'll get back to
                  you as soon as possible.
                </ThemedText>
              </View>

              <View className="gap-10">
                {/* Form - stacked first on small screens, below map on large screens */}
                <View className="order-2 lg:order-2">
                  <View className="mx-auto w-full max-w-2xl">
                    {/* Form Card */}
                    <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                      {/* Success/Error Alert */}
                      {inlineStatus && (
                        <View className="mb-6">
                          {inlineStatus === 'success' ? (
                            <Alert
                              variant="success"
                              message="Thank you! Your message has been submitted successfully. We'll get back to you soon."
                            />
                          ) : (
                            <Alert variant="error" message={inlineStatus} />
                          )}
                        </View>
                      )}

                      {/* Name Field */}
                      <View className="mb-5">
                        <Text className="form-label mb-2">
                          Name <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                          value={name}
                          onChangeText={value => handleInputChange('name', value)}
                          autoCapitalize="words"
                          placeholder="John Doe"
                          className={isAuthenticated ? 'form-input-disabled' : 'form-input'}
                          editable={!isAuthenticated && !isSubmitting}
                        />
                        {errors.name && (
                          <Text className="form-message-error mt-1">{errors.name}</Text>
                        )}
                      </View>

                      {/* Email Field */}
                      <View className="mb-5">
                        <Text className="form-label mb-2">
                          Email <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                          value={email}
                          onChangeText={value => handleInputChange('email', value)}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoComplete="email"
                          placeholder="john@example.com"
                          className={isAuthenticated ? 'form-input-disabled' : 'form-input'}
                          editable={!isAuthenticated && !isSubmitting}
                        />
                        {errors.email && (
                          <Text className="form-message-error mt-1">{errors.email}</Text>
                        )}
                      </View>

                      {/* Phone Field */}
                      <View className="mb-5">
                        <Text className="form-label mb-2">Phone (Optional)</Text>
                        <TextInput
                          value={phone}
                          onChangeText={value => handleInputChange('phone', value)}
                          keyboardType="phone-pad"
                          placeholder="+254712345678"
                          className={isAuthenticated ? 'form-input-disabled' : 'form-input'}
                          editable={!isAuthenticated && !isSubmitting}
                        />
                        {errors.phone && (
                          <Text className="form-message-error mt-1">{errors.phone}</Text>
                        )}
                      </View>

                      {/* Subject Field */}
                      <View className="mb-5">
                        <Text className="form-label mb-2">
                          Subject <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                          value={subject}
                          onChangeText={value => handleInputChange('subject', value)}
                          autoCapitalize="sentences"
                          placeholder="Inquiry about services"
                          className="form-input"
                          editable={!isSubmitting}
                        />
                        {errors.subject && (
                          <Text className="form-message-error mt-1">{errors.subject}</Text>
                        )}
                      </View>

                      {/* Message Field */}
                      <View className="mb-6">
                        <View className="mb-2 flex-row items-center justify-between">
                          <Text className="form-label">
                            Message <Text className="text-red-500">*</Text>
                          </Text>
                          <Text
                            className={`text-xs font-inter ${
                              isMessageValid
                                ? 'text-gray-500'
                                : isMessageTooShort || isMessageTooLong
                                  ? 'text-red-500'
                                  : 'text-gray-500'
                            }`}>
                            {messageLength}/{messageMaxLength}
                          </Text>
                        </View>
                        <TextInput
                          value={message}
                          onChangeText={value => handleInputChange('message', value)}
                          multiline
                          numberOfLines={6}
                          textAlignVertical="top"
                          placeholder="I would like to know more about your services..."
                          className="form-input min-h-[120px]"
                          editable={!isSubmitting}
                        />
                        {errors.message && (
                          <Text className="form-message-error mt-1">{errors.message}</Text>
                        )}
                        {messageLength > 0 && (
                          <Text
                            className={`mt-1 text-xs font-inter ${
                              isMessageValid
                                ? 'text-gray-500'
                                : isMessageTooShort
                                  ? 'text-yellow-600'
                                  : 'text-red-500'
                            }`}>
                            {isMessageTooShort
                              ? `Message must be at least ${messageMinLength} characters`
                              : isMessageTooLong
                                ? `Message cannot exceed ${messageMaxLength} characters`
                                : `${messageMaxLength - messageLength} characters remaining`}
                          </Text>
                        )}
                      </View>

                      {/* Submit Button */}
                      <Pressable
                        onPress={handleSubmit}
                        disabled={isSubmitting || submitMutation.isPending}
                        className="btn btn-primary w-full">
                        {isSubmitting || submitMutation.isPending ? (
                          <ActivityIndicator color="#ffffff" />
                        ) : (
                          <Text className="btn-text btn-text-primary">Send Message</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                </View>

                {/* Map + Contact Card */}
                <View className="order-1 lg:order-1 flex-col gap-6 lg:flex-row">
                  <View className="w-full lg:w-[65%] lg:pr-2">
                    <View className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
                      <View className="h-72 lg:h-[450px] w-full">
                        {Platform.OS === 'web' ? (
                          <iframe
                            src={mapEmbedUrl}
                            style={{ width: '100%', height: '100%', border: '0' }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                          />
                        ) : (
                          <WebView
                            originWhitelist={['*']}
                            source={{ uri: mapEmbedUrl }}
                            style={{ flex: 1, backgroundColor: 'transparent' }}
                          />
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Get in Touch */}
                  <View className="w-full lg:w-[35%] lg:pl-2">
                    <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                      <ThemedText className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Get in Touch
                      </ThemedText>

                      <View className="mb-4 flex-row items-start gap-3">
                        <View className="rounded-full bg-rose-50 p-2 dark:bg-rose-900/20">
                          <MaterialIcons name="place" size={20} color="#9f1239" />
                        </View>
                        <View>
                          <Text className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Visit Us
                          </Text>
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                            123 Innovation Drive, Suite 500
                          </Text>
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                            San Francisco, CA 94103
                          </Text>
                        </View>
                      </View>

                      <View className="mb-4 flex-row items-start gap-3">
                        <View className="rounded-full bg-blue-50 p-2 dark:bg-blue-900/20">
                          <MaterialIcons name="email" size={20} color="#1d4ed8" />
                        </View>
                        <View>
                          <Text className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Email Us
                          </Text>
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                            siretect@gmail.com
                          </Text>
                        </View>
                      </View>

                      <View className="mb-6 flex-row items-start gap-3">
                        <View className="rounded-full bg-emerald-50 p-2 dark:bg-emerald-900/20">
                          <MaterialIcons name="call" size={20} color="#047857" />
                        </View>
                        <View>
                          <Text className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
                            Call Us
                          </Text>
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                            0111202895
                          </Text>
                        </View>
                      </View>

                      <View className="border-t border-gray-100 pt-4 dark:border-gray-800">
                        <Text className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Follow Us
                        </Text>
                        <View className="flex-row items-center gap-3">
                          {socialLinks.map(link => (
                            <Pressable
                              key={link.label}
                              onPress={() => Linking.openURL(link.url)}
                              className="h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                              <FontAwesome name={link.icon} size={18} color="#6b7280" />
                            </Pressable>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Additional Information */}
              <View className="mt-6">
                <ThemedText className="text-center text-sm font-inter text-gray-500 dark:text-gray-400">
                  We typically respond within 24-48 hours during business days.
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </ThemedView>
  );
}
