import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { formatCurrency, formatDate } from '@/utils';
import { useGetPayment } from '@/tanstack/usePayments';

export default function PaymentDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const paymentId = id || '';

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetPayment(paymentId);

  const payment = useMemo(() => {
    const root = data?.data ?? data;
    return root?.data?.payment ?? root?.payment ?? root?.data ?? root;
  }, [data]);

  const errorMsg =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load payment details';

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

  const handleViewInvoice = () => {
    const invoiceId = payment?.invoice?._id ?? payment?.invoice ?? payment?.invoiceId;
    if (invoiceId) {
      router.push(`/(authenticated)/invoices/${invoiceId}` as any);
    }
  };

  const handleBackToInvoice = () => {
    const invoiceId = payment?.invoice?._id ?? payment?.invoice ?? payment?.invoiceId;
    if (invoiceId) {
      router.push(`/(authenticated)/invoices/${invoiceId}` as any);
    } else {
      router.back();
    }
  };

  if (isLoading && !payment) {
    return <Loading fullScreen message="Loading payment details..." />;
  }

  if (!payment) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-6 py-8">
            <Alert variant="error" message={errorMsg || 'Payment not found'} className="w-full" />
            <Pressable
              onPress={() => router.back()}
              className="mt-4 rounded-xl bg-brand-primary px-6 py-3">
              <Text className="font-inter text-base font-semibold text-white text-center">
                Go Back
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  const status = payment.status || 'pending';
  const paymentMethod = payment.paymentMethod || 'N/A';
  const amount = payment.amount || 0;
  const currency = payment.currency || 'KES';
  const invoice = payment.invoice || payment.invoiceId;
  const invoiceId = invoice?._id ?? invoice?.id ?? invoice;
  const invoiceNumber = invoice?.invoiceNumber ?? invoiceId ?? '—';

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }>
        <View className="px-6 py-8 gap-6">
          {/* Header */}
          <View className="gap-3">
            <Text className="font-poppins text-2xl font-bold text-gray-900 dark:text-gray-100">
              {payment.paymentNumber || `Payment #${paymentId?.slice(-6) || 'N/A'}`}
            </Text>
            <View className="flex-row items-center gap-2 flex-wrap">
              <Badge
                variant={getStatusVariant(status)}
                size="md"
                icon={
                  <MaterialIcons
                    name={getStatusIcon(status) as any}
                    size={16}
                    color={getStatusColor(status)}
                  />
                }>
                {status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge
                variant={getMethodVariant(paymentMethod)}
                size="md"
                icon={
                  <MaterialIcons
                    name={getMethodIcon(paymentMethod) as any}
                    size={16}
                    color="#7b1c1c"
                  />
                }>
                {paymentMethod.toUpperCase()}
              </Badge>
            </View>
          </View>

          {error ? (
            <Alert variant="error" message={errorMsg} className="w-full" />
          ) : null}

          {/* Transaction Details */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="info" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Transaction Details
              </Text>
            </View>
            <View className="gap-3">
              <InfoRow
                icon="attach-money"
                label="Amount"
                value={formatCurrency(amount, currency)}
              />
              <InfoRow
                icon="event"
                label="Payment Date"
                value={formatDate(payment.paymentDate ?? payment.createdAt)}
              />
              {payment.paymentNumber && (
                <InfoRow
                  icon="confirmation-number"
                  label="Payment Number"
                  value={payment.paymentNumber}
                />
              )}
              {payment.transactionId && (
                <InfoRow
                  icon="receipt"
                  label="Transaction ID"
                  value={payment.transactionId}
                />
              )}
              {payment.reference && (
                <InfoRow
                  icon="bookmark"
                  label="Reference"
                  value={payment.reference}
                />
              )}
            </View>
          </View>

          {/* Invoice Reference */}
          {invoiceId && (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="description" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Invoice Reference
                </Text>
              </View>
              <View className="gap-3">
                <InfoRow
                  icon="receipt"
                  label="Invoice Number"
                  value={invoiceNumber}
                />
                <Pressable
                  onPress={handleViewInvoice}
                  className="mt-2 rounded-xl border-2 border-brand-primary bg-white px-4 py-3 active:bg-gray-50 dark:bg-gray-900 dark:active:bg-gray-800">
                  <View className="flex-row items-center justify-center gap-2">
                    <MaterialIcons name="description" size={18} color="#7b1c1c" />
                    <Text className="font-inter text-base font-semibold text-brand-primary">
                      View Invoice
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>
          )}

          {/* Payment Method Metadata */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="payment" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Payment Method Details
              </Text>
            </View>
            <View className="gap-3">
              {paymentMethod.toLowerCase() === 'mpesa' && (
                <>
                  {payment.metadata?.phoneNumber && (
                    <InfoRow
                      icon="phone"
                      label="Phone Number"
                      value={payment.metadata.phoneNumber}
                    />
                  )}
                  {payment.processorRefs?.daraja?.checkoutRequestId && (
                    <InfoRow
                      icon="receipt"
                      label="Checkout Request ID"
                      value={payment.processorRefs.daraja.checkoutRequestId}
                    />
                  )}
                  {payment.processorRefs?.daraja?.merchantRequestId && (
                    <InfoRow
                      icon="confirmation-number"
                      label="Merchant Request ID"
                      value={payment.processorRefs.daraja.merchantRequestId}
                    />
                  )}
                </>
              )}
              {paymentMethod.toLowerCase() === 'paystack' && (
                <>
                  {payment.metadata?.email && (
                    <InfoRow
                      icon="mail-outline"
                      label="Email"
                      value={payment.metadata.email}
                    />
                  )}
                  {payment.processorRefs?.paystack?.reference && (
                    <InfoRow
                      icon="confirmation-number"
                      label="Paystack Reference"
                      value={payment.processorRefs.paystack.reference}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          {/* Notes */}
          {payment.notes && (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="note" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Notes
                </Text>
              </View>
              <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                {payment.notes}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-3">
            {invoiceId && (
              <Pressable
                onPress={handleBackToInvoice}
                className="rounded-xl border-2 border-brand-primary bg-brand-primary px-6 py-4 active:bg-brand-accent">
                <View className="flex-row items-center justify-center gap-2">
                  <MaterialIcons name="arrow-back" size={20} color="#ffffff" />
                  <Text className="font-inter text-base font-semibold text-white">
                    Back to Invoice
                  </Text>
                </View>
              </Pressable>
            )}
            {invoiceId && (
              <Pressable
                onPress={handleViewInvoice}
                className="rounded-xl border-2 border-brand-primary bg-white px-6 py-4 active:bg-gray-50 dark:bg-gray-900 dark:active:bg-gray-800">
                <View className="flex-row items-center justify-center gap-2">
                  <MaterialIcons name="description" size={20} color="#7b1c1c" />
                  <Text className="font-inter text-base font-semibold text-brand-primary">
                    View Invoice
                  </Text>
                </View>
              </Pressable>
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
