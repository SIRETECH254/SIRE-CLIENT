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
import { useGetClientInvoices } from '@/tanstack/useInvoices';

export default function InvoicesPage() {
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
  } = useGetClientInvoices(clientId || '');

  const invoices = useMemo(() => {
    return data?.data?.invoices || data?.invoices || data?.data || data || [];
  }, [data]);

  const errorMessage =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load invoices';

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'info';
      case 'partially_paid':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'draft':
        return 'default';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'check-circle';
      case 'sent':
        return 'send';
      case 'partially_paid':
        return 'account-balance-wallet';
      case 'overdue':
        return 'warning';
      case 'draft':
        return 'draft';
      case 'cancelled':
        return 'cancel';
      default:
        return 'receipt';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return '#059669';
      case 'sent':
        return '#2563eb';
      case 'partially_paid':
        return '#f59e0b';
      case 'overdue':
        return '#dc2626';
      case 'draft':
        return '#6b7280';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const handleInvoicePress = (invoiceId: string) => {
    router.push(`/(authenticated)/invoices/${invoiceId}`);
  };

  // Invoice Skeleton Component
  const InvoiceSkeleton = () => (
    <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <View className="gap-4">
        {/* Header */}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="h-6 bg-gray-200 rounded mb-2 w-3/4 dark:bg-gray-700" />
            <View className="h-4 bg-gray-200 rounded w-2/3 dark:bg-gray-700" />
          </View>
          <View className="w-6 h-6 bg-gray-200 rounded dark:bg-gray-700" />
        </View>

        {/* Status Badge */}
        <View className="flex-row items-center gap-2">
          <View className="h-6 bg-gray-200 rounded-full w-24 dark:bg-gray-700" />
        </View>

        {/* Amount */}
        <View className="flex-row items-center justify-between">
          <View className="h-4 bg-gray-200 rounded w-20 dark:bg-gray-700" />
          <View className="h-5 bg-gray-200 rounded w-24 dark:bg-gray-700" />
        </View>

        {/* Paid Amount (optional) */}
        <View className="flex-row items-center justify-between">
          <View className="h-4 bg-gray-200 rounded w-20 dark:bg-gray-700" />
          <View className="h-4 bg-gray-200 rounded w-20 dark:bg-gray-700" />
        </View>

        {/* Dates */}
        <View className="flex-row items-center gap-4">
          <View className="h-3 bg-gray-200 rounded w-28 dark:bg-gray-700" />
          <View className="h-3 bg-gray-200 rounded w-28 dark:bg-gray-700" />
        </View>
      </View>
    </View>
  );

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
              My Invoices
            </Text>
            <Text className="font-inter text-base text-gray-600 dark:text-gray-400 mt-2">
              View and manage your invoices
            </Text>
          </View>

          {error && !isLoading ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {isLoading && !invoices.length && (
            <View className="gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <InvoiceSkeleton key={`skeleton-${index}`} />
              ))}
            </View>
          )}

          {!isLoading && invoices.length === 0 && (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="receipt" size={64} color="#9ca3af" />
              <Text className="font-inter text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">
                No invoices found
              </Text>
              <Text className="font-inter text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                You don't have any invoices yet.
              </Text>
            </View>
          )}

          {!isLoading && invoices.length > 0 && (
            <View className="gap-4">
              {invoices.map((invoice: any) => {
                const invoiceId = invoice._id || invoice.id;
                const status = invoice.status || 'draft';
                const total = invoice.totalAmount || invoice.total || 0;
                const projectTitle = invoice.projectTitle || 'No Project';

                return (
                  <Pressable
                    key={invoiceId}
                    onPress={() => handleInvoicePress(invoiceId)}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <View className="gap-4">
                      {/* Header */}
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {invoice.invoiceNumber || `Invoice #${invoiceId?.slice(-6) || 'N/A'}`}
                          </Text>
                          {projectTitle !== 'No Project' ? (
                            <Text className="font-inter text-base text-gray-700 dark:text-gray-300 mt-1">
                              {projectTitle}
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

                      {/* Payment Status */}
                      {invoice.paidAmount !== undefined && invoice.paidAmount > 0 ? (
                        <View className="flex-row items-center justify-between">
                          <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                            Paid Amount
                          </Text>
                          <Text className="font-inter text-base font-medium text-gray-900 dark:text-gray-100">
                            {formatCurrency(invoice.paidAmount, 'KES')}
                          </Text>
                        </View>
                      ) : null}

                      {/* Dates */}
                      <View className="flex-row items-center gap-4 flex-wrap">
                        {invoice.dueDate ? (
                          <View className="flex-row items-center gap-2">
                            <MaterialIcons name="event" size={16} color="#6b7280" />
                            <Text className="font-inter text-xs text-gray-600 dark:text-gray-400">
                              Due: {formatDate(invoice.dueDate)}
                            </Text>
                          </View>
                        ) : null}
                        {invoice.createdAt ? (
                          <View className="flex-row items-center gap-2">
                            <MaterialIcons name="schedule" size={16} color="#6b7280" />
                            <Text className="font-inter text-xs text-gray-500 dark:text-gray-500">
                              Created {formatDate(invoice.createdAt)}
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
