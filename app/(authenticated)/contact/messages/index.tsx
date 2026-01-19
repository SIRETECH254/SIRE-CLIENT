import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { formatDate } from '@/utils';
import { useGetMyMessages } from '@/tanstack/useContact';

export default function ContactMessagesPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch, isRefetching } = useGetMyMessages();

  const messages = useMemo(() => {
    const list = data?.data?.messages || data?.messages || data?.data || data || [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const errorMessage =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load messages';

  const getMessageStatus = (message: any) => {
    if (message?.status) return String(message.status);
    if (message?.read || message?.isRead || message?.readAt) return 'read';
    return 'unread';
  };

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'read':
        return 'success';
      case 'unread':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'read':
        return 'mark-email-read';
      case 'unread':
        return 'mark-email-unread';
      case 'archived':
        return 'archive';
      default:
        return 'mail-outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'read':
        return '#059669';
      case 'unread':
        return '#f59e0b';
      case 'archived':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleMessagePress = (messageId: string) => {
    router.push(`/(authenticated)/contact/messages/${messageId}`);
  };

  if (isLoading && !messages.length) {
    return <Loading fullScreen message="Loading messages..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        <View className="px-6 py-8 gap-6">
          <View className="mb-4">
            <Text className="font-poppins text-3xl font-bold text-gray-900 dark:text-gray-100">
              Contact Messages
            </Text>
            <Text className="font-inter text-base text-gray-600 dark:text-gray-400 mt-2">
              View and manage contact messages
            </Text>
          </View>

          {error && !isLoading ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {!isLoading && messages.length === 0 ? (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="inbox" size={64} color="#9ca3af" />
              <Text className="font-inter text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">
                No messages found
              </Text>
              <Text className="font-inter text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                You don't have any contact messages yet.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {messages.map((message: any) => {
                const messageId = message._id || message.id;
                const status = getMessageStatus(message);
                const subject = message.subject || 'No subject';
                const preview = message.message || message.body || '';
                const senderName = message.name || 'Unknown sender';
                const senderEmail = message.email || '';
                const createdAt = message.createdAt || message.date || message.sentAt;

                return (
                  <Pressable
                    key={messageId}
                    onPress={() => handleMessagePress(messageId)}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <View className="gap-4">
                      {/* Header */}
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {subject}
                          </Text>
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {senderName}
                            {senderEmail ? ` • ${senderEmail}` : ''}
                          </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                      </View>

                      {/* Status Badge */}
                      <View className="flex-row items-center gap-2 flex-wrap">
                        <Badge
                          variant={getStatusVariant(status)}
                          size="sm"
                          icon={
                            <MaterialIcons
                              name={getStatusIcon(status) as any}
                              size={14}
                              color={getStatusColor(status)}
                            />
                          }>
                          {status.toUpperCase()}
                        </Badge>
                      </View>

                      {/* Preview */}
                      {preview ? (
                        <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                          {preview.length > 120 ? `${preview.slice(0, 120)}...` : preview}
                        </Text>
                      ) : null}

                      {/* Date */}
                      {createdAt ? (
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="schedule" size={16} color="#6b7280" />
                          <Text className="font-inter text-xs text-gray-500 dark:text-gray-500">
                            {formatDate(createdAt)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
