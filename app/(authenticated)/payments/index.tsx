import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
import { useGetClientPayments, useGetInvoicePayments } from '@/tanstack/usePayments';

export default function PaymentsPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ invoiceId?: string }>();
  const invoiceId = params.invoiceId || '';
  const { user } = useAuth();
  const { data: profileData } = useGetProfile();

  // Get clientId from profile or user
  const clientId = useMemo(() => {
    const profile = profileData?.data?.user;
    return profile?._id || profile?.id || user?._id || user?.id || null;
  }, [profileData, user]);

  // Use invoice payments if invoiceId provided, otherwise use client payments
  const {
    data: invoicePaymentsData,
    isLoading: isLoadingInvoicePayments,
    error: invoicePaymentsError,
    refetch: refetchInvoicePayments,
    isRefetching: isRefetchingInvoicePayments,
  } = useGetInvoicePayments(invoiceId || '');

  const {
    data: clientPaymentsData,
    isLoading: isLoadingClientPayments,
    error: clientPaymentsError,
    refetch: refetchClientPayments,
    isRefetching: isRefetchingClientPayments,
  } = useGetClientPayments(clientId || '');

  // Determine which data to use
  const isLoading = invoiceId ? isLoadingInvoicePayments : isLoadingClientPayments;
  const error = invoiceId ? invoicePaymentsError : clientPaymentsError;
  const isRefetching = invoiceId ? isRefetchingInvoicePayments : isRefetchingClientPayments;
  const refetch = invoiceId ? refetchInvoicePayments : refetchClientPayments;

  const payments = useMemo(() => {
    if (invoiceId) {
      const root = invoicePaymentsData?.data ?? invoicePaymentsData;
      return root?.data?.payments ?? root?.payments ?? root?.data ?? root ?? [];
    } else {
      const root = clientPaymentsData?.data ?? clientPaymentsData;
      return root?.data?.payments ?? root?.payments ?? root?.data ?? root ?? [];
    }
  }, [invoiceId, invoicePaymentsData, clientPaymentsData]);

  const errorMessage =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load payments';

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'hourglass-empty';
      case 'processing':
        return 'sync';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'cancel';
      default:
        return 'payment';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#059669';
      case 'pending':
        return '#f59e0b';
      case 'processing':
        return '#2563eb';
      case 'failed':
        return '#dc2626';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getMethodVariant = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'mpesa':
        return 'info';
      case 'paystack':
        return 'default';
      default:
        return 'default';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method?.toLowerCase()) {
      case 'mpesa':
        return 'phone-android';
      case 'paystack':
        return 'credit-card';
      default:
        return 'payment';
    }
  };

  const handlePaymentPress = (paymentId: string) => {
    router.push(`/(authenticated)/payments/${paymentId}`);
  };

  if (isLoading && !payments.length) {
    return <Loading fullScreen message="Loading payments..." />;
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
              {invoiceId ? 'Invoice Payments' : 'All Payments'}
            </Text>
            <Text className="font-inter text-base text-gray-600 dark:text-gray-400 mt-2">
              {invoiceId ? 'View payments for this invoice' : 'View your payment history'}
            </Text>
          </View>

          {error && !isLoading ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {!isLoading && payments.length === 0 ? (
            <View className="items-center justify-center py-12">
              <MaterialIcons name="payment" size={64} color="#9ca3af" />
              <Text className="font-inter text-lg font-semibold text-gray-700 dark:text-gray-300 mt-4">
                No payments found
              </Text>
              <Text className="font-inter text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                {invoiceId
                  ? 'This invoice does not have any payments yet.'
                  : "You don't have any payments yet."}
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              {payments.map((payment: any) => {
                const paymentId = payment._id || payment.id;
                const status = payment.status || 'pending';
                const paymentMethod = payment.paymentMethod || 'N/A';
                const amount = payment.amount || 0;
                const currency = payment.currency || 'KES';
                const paymentDate = payment.paymentDate || payment.createdAt;
                const invoice = payment.invoice || payment.invoiceId;
                const invoiceNumber = invoice?.invoiceNumber ?? invoice?._id ?? invoice ?? '—';

                return (
                  <Pressable
                    key={paymentId}
                    onPress={() => handlePaymentPress(paymentId)}
                    className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 active:opacity-70">
                    <View className="gap-4">
                      {/* Header */}
                      <View className="flex-row items-start justify-between gap-3">
                        <View className="flex-1">
                          <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {payment.paymentNumber || `Payment #${paymentId?.slice(-6) || 'N/A'}`}
                          </Text>
                          {invoiceNumber && invoiceNumber !== '—' && (
                            <Text className="font-inter text-base text-gray-700 dark:text-gray-300 mt-1">
                              Invoice: {invoiceNumber}
                            </Text>
                          )}
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#9ca3af" />
                      </View>

                      {/* Status and Method Badges */}
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
                          {status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge
                          variant={getMethodVariant(paymentMethod)}
                          size="sm"
                          icon={
                            <MaterialIcons
                              name={getMethodIcon(paymentMethod) as any}
                              size={14}
                              color="#7b1c1c"
                            />
                          }>
                          {paymentMethod.toUpperCase()}
                        </Badge>
                      </View>

                      {/* Amount */}
                      <View className="flex-row items-center justify-between">
                        <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                          Amount
                        </Text>
                        <Text className="font-inter text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(amount, currency)}
                        </Text>
                      </View>

                      {/* Date */}
                      {paymentDate && (
                        <View className="flex-row items-center gap-2">
                          <MaterialIcons name="event" size={16} color="#6b7280" />
                          <Text className="font-inter text-xs text-gray-600 dark:text-gray-400">
                            {formatDate(paymentDate)}
                          </Text>
                        </View>
                      )}
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
