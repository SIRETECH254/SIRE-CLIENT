import React, { useMemo } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { formatDate } from '@/utils';
import { useGetMessage } from '@/tanstack/useContact';

export default function ContactMessageDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const messageId = id || '';

  const { data, isLoading, error, refetch, isRefetching } = useGetMessage(messageId);

  const message = useMemo(() => {
    return data?.data?.message || data?.message || data?.data || data || null;
  }, [data]);

  const errorMessage =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load message';

  const getMessageStatus = (messageData: any) => {
    if (messageData?.status) return String(messageData.status);
    if (messageData?.read || messageData?.isRead || messageData?.readAt) return 'read';
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

  const replies = useMemo(() => {
    if (!message) return [];
    const rawReplies =
      message.replies ??
      message.reply ??
      message.responses ??
      message.response ??
      message.adminReply;
    if (!rawReplies) return [];
    return Array.isArray(rawReplies) ? rawReplies : [rawReplies];
  }, [message]);

  const normalizeReply = (reply: any) => {
    if (typeof reply === 'string') {
      return { body: reply, createdAt: undefined };
    }
    if (typeof reply === 'object' && reply) {
      return {
        body: reply.reply || reply.message || reply.body || reply.text || '',
        createdAt: reply.createdAt || reply.date || reply.sentAt,
      };
    }
    return { body: String(reply ?? ''), createdAt: undefined };
  };

  if (isLoading && !message) {
    return <Loading fullScreen message="Loading message..." />;
  }

  if (!message) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-6 py-8">
            <Alert variant="error" message={errorMessage || 'Message not found'} className="w-full" />
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  const status = getMessageStatus(message);
  const subject = message.subject || 'No subject';
  const createdAt = message.createdAt || message.date || message.sentAt;
  const senderName = message.name || 'Unknown sender';
  const senderEmail = message.email || 'N/A';
  const senderPhone = message.phone || 'N/A';
  const content = message.message || message.body || '';

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
        <View className="px-6 py-8 gap-6">
          {/* Header */}
          <View className="gap-3">
            <Text className="font-poppins text-2xl font-bold text-gray-900 dark:text-gray-100">
              {subject}
            </Text>
            <View className="flex-row items-center gap-2 flex-wrap">
              <Badge variant={getStatusVariant(status)} size="md">
                {status.toUpperCase()}
              </Badge>
              {createdAt ? (
                <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                  • {formatDate(createdAt)}
                </Text>
              ) : null}
            </View>
          </View>

          {error ? <Alert variant="error" message={errorMessage} className="w-full" /> : null}

          {/* Sender Info */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="person" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Sender Details
              </Text>
            </View>
            <View className="gap-3">
              <InfoRow icon="person" label="Name" value={senderName} />
              <InfoRow icon="email" label="Email" value={senderEmail} />
              <InfoRow icon="call" label="Phone" value={senderPhone} />
              <InfoRow icon="mail-outline" label="Status" value={status.toUpperCase()} />
              {createdAt ? (
                <InfoRow icon="schedule" label="Received" value={formatDate(createdAt)} />
              ) : null}
            </View>
          </View>

          {/* Message Content */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="message" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Message
              </Text>
            </View>
            <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
              {content || 'No message content available.'}
            </Text>
          </View>

          {/* Replies */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="forum" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Replies
              </Text>
            </View>
            {replies.length === 0 ? (
              <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">
                No replies yet.
              </Text>
            ) : (
              <View className="gap-4">
                {replies.map((reply: any, index: number) => {
                  const normalized = normalizeReply(reply);
                  return (
                    <View
                      key={reply?._id || reply?.id || index}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                      <Text className="font-inter text-sm text-gray-700 dark:text-gray-300">
                        {normalized.body || '—'}
                      </Text>
                      {normalized.createdAt ? (
                        <View className="flex-row items-center gap-2 mt-3">
                          <MaterialIcons name="schedule" size={14} color="#6b7280" />
                          <Text className="font-inter text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(normalized.createdAt)}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2">
        <MaterialIcons name={icon} size={18} color="#9ca3af" />
        <Text className="font-inter text-sm text-gray-500 dark:text-gray-400">{label}</Text>
      </View>
      <Text className="text-right font-inter text-base text-gray-900 dark:text-gray-100">
        {value ?? '—'}
      </Text>
    </View>
  );
}
