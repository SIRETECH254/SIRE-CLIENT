import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
import { useGetClientQuotations } from '@/tanstack/useQuotations';

export default function QuotationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: profileData } = useGetProfile();

  // Get clientId from profile or user
  const clientId = useMemo(() => {
    const profile = profileData?.data?.user;
    return profile?._id || profile?.id || user?._id || user?.id || null;
  }, [profileData, user]);

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetClientQuotations(clientId || '');

  const quotations = useMemo(() => {
    return data?.data?.quotations || data?.quotations || data?.data || data || [];
  }, [data]);

  const errorMessage =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load quotations';

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'success';
      case 'sent':
        return 'info';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      case 'converted':
        return 'default';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return 'check-circle';
      case 'sent':
        return 'send';
      case 'pending':
        return 'hourglass-empty';
      case 'rejected':
        return 'cancel';
      case 'converted':
        return 'transform';
      case 'draft':
        return 'draft';
      default:
        return 'description';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return '#059669';
      case 'sent':
        return '#2563eb';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#dc2626';
      case 'converted':
        return '#6b7280';
      case 'draft':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleQuotationPress = (quotationId: string) => {
    router.push(`/(authenticated)/quotations/${quotationId}`);
  };

  if (isLoading && !quotations.length) {
    return <Loading fullScreen message="Loading quotations..." />;
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }>
        <View className="px-6 py-8 gap-6">
          <View className="mb-4">
            <Text className="font-poppins text-3xl font-bold text-gray-900 dark:text-gray-100">
              My Quotations
            </Text>
            <Text className="font-inter text-base text-gray-600 dark:text-gray-400 mt-2">
              View and manage your quotations
            </Text>
          </View>

          {error && !isLoading ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {!isLoading && quotations.length === 0 ? (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="description" size={64} color="#9ca3af" />
              <Text className="font-inter text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">
                No quotations found
              </Text>
              <Text className="font-inter text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                You don't have any quotations yet.
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {quotations.map((quotation: any) => {
                const quotationId = quotation._id || quotation.id;
                const status = quotation.status || 'draft';
                const total = quotation.total || quotation.amount || 0;
                const project = quotation.project || {};
                const projectName = project.title || project.name || 'No Project';

                return (
                  <Pressable
                    key={quotationId}
                    onPress={() => handleQuotationPress(quotationId)}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <View className="gap-4">
                      {/* Header */}
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {quotation.quotationNumber || `Quotation #${quotationId?.slice(-6) || 'N/A'}`}
                          </Text>
                          {projectName !== 'No Project' ? (
                            <Text className="font-inter text-base text-gray-700 dark:text-gray-300 mt-1">
                              {projectName}
                            </Text>
                          ) : null}
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                      </View>

                      {/* Status Badge */}
                      <View className="flex-row items-center gap-2 flex-wrap">
                        {status ? (
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
                            {status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        ) : null}
                      </View>

                      {/* Amount */}
                      <View className="flex-row items-center justify-between">
                        <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                          Total Amount
                        </Text>
                        <Text className="font-inter text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(total, 'KES')}
                        </Text>
                      </View>

                      {/* Dates */}
                      <View className="flex-row items-center gap-4 flex-wrap">
                        {quotation.validUntil ? (
                          <View className="flex-row items-center gap-2">
                            <MaterialIcons name="event" size={16} color="#6b7280" />
                            <Text className="font-inter text-xs text-gray-600 dark:text-gray-400">
                              Valid until: {formatDate(quotation.validUntil)}
                            </Text>
                          </View>
                        ) : null}
                        {quotation.createdAt ? (
                          <View className="flex-row items-center gap-2">
                            <MaterialIcons name="schedule" size={16} color="#6b7280" />
                            <Text className="font-inter text-xs text-gray-500 dark:text-gray-500">
                              Created {formatDate(quotation.createdAt)}
                            </Text>
                          </View>
                        ) : null}
                      </View>
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
