import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/utils';
import {
  useGetInvoice,
  useGetInvoicePayments,
  useGenerateInvoicePDF,
} from '@/tanstack/useInvoices';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const invoiceId = id || '';

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetInvoice(invoiceId);

  const {
    data: paymentsData,
    isLoading: isLoadingPayments,
  } = useGetInvoicePayments(invoiceId);

  const generatePDFMutation = useGenerateInvoicePDF();

  const invoice = useMemo(() => {
    return data?.data?.invoice || data?.invoice || data?.data || data || null;
  }, [data]);

  const payments = useMemo(() => {
    const paymentsList = paymentsData?.data?.payments || paymentsData?.payments || paymentsData?.data || paymentsData || [];
    // Return last 5 payments
    return Array.isArray(paymentsList) ? paymentsList.slice(0, 5) : [];
  }, [paymentsData]);

  const errorMsg =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load invoice details';

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

  const getPaymentStatusVariant = (status: string) => {
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

  const getPaymentStatusIcon = (status: string) => {
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

  const getPaymentStatusColor = (status: string) => {
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

  const handleGeneratePDF = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await generatePDFMutation.mutateAsync(invoiceId);
      const pdfUrl = result?.pdfUrl || result?.data?.pdfUrl;
      if (pdfUrl) {
        // Open PDF in new tab/window
        if (typeof window !== 'undefined') {
          window.open(pdfUrl, '_blank');
        }
        setSuccessMessage('PDF generated successfully');
      } else {
        setErrorMessage('PDF URL not found in response');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to generate PDF';
      setErrorMessage(msg);
    }
  };

  const handlePayment = () => {
    // Non-functional for now - placeholder
    setErrorMessage(null);
    setSuccessMessage('Payment functionality coming soon');
  };

  if (isLoading && !invoice) {
    return <Loading fullScreen message="Loading invoice details..." />;
  }

  if (!invoice) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-6 py-8">
            <Alert variant="error" message={errorMsg || 'Invoice not found'} className="w-full" />
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

  const status = invoice.status || 'draft';
  const items = invoice.items || [];
  const client = invoice.client || {};
  const projectTitle = invoice.projectTitle || 'No Project';
  const subtotal = invoice.subtotal || 0;
  const tax = invoice.tax || 0;
  const discount = invoice.discount || 0;
  const totalAmount = invoice.totalAmount || invoice.total || 0;
  const paidAmount = invoice.paidAmount || 0;
  const remainingBalance = totalAmount - paidAmount;

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
              {invoice.invoiceNumber || `Invoice #${invoiceId?.slice(-6) || 'N/A'}`}
            </Text>
            <View className="flex-row items-center gap-2 flex-wrap">
              {status ? (
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
              ) : null}
              {projectTitle !== 'No Project' ? (
                <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                  • {projectTitle}
                </Text>
              ) : null}
            </View>
          </View>

          {error ? (
            <Alert variant="error" message={errorMsg} className="w-full" />
          ) : null}

          {successMessage ? (
            <Alert variant="success" message={successMessage} className="w-full" />
          ) : null}

          {errorMessage ? (
            <Alert variant="error" message={errorMessage} className="w-full" />
          ) : null}

          {/* Client & Project Info */}
          {(client.firstName || client.email || projectTitle !== 'No Project') ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="person" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Client & Project Information
                </Text>
              </View>
              <View className="gap-3">
                {client.firstName || client.lastName ? (
                  <InfoRow
                    icon="person"
                    label="Client Name"
                    value={`${client.firstName || ''} ${client.lastName || ''}`.trim()}
                  />
                ) : null}
                {client.email ? (
                  <InfoRow icon="mail-outline" label="Email" value={client.email} />
                ) : null}
                {client.phone ? (
                  <InfoRow icon="call" label="Phone" value={client.phone} />
                ) : null}
                {client.company ? (
                  <InfoRow icon="business" label="Company" value={client.company} />
                ) : null}
                {projectTitle !== 'No Project' ? (
                  <InfoRow icon="folder" label="Project" value={projectTitle} />
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Invoice Metadata */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="info" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
        Invoice Details
              </Text>
            </View>
            <View className="gap-3">
              {invoice.dueDate ? (
                <InfoRow icon="event" label="Due Date" value={formatDate(invoice.dueDate)} />
              ) : null}
              {invoice.paidDate ? (
                <InfoRow icon="check-circle" label="Paid Date" value={formatDate(invoice.paidDate)} />
              ) : null}
              {invoice.createdAt ? (
                <InfoRow icon="schedule" label="Created" value={formatDate(invoice.createdAt)} />
              ) : null}
              {invoice.updatedAt ? (
                <InfoRow icon="update" label="Last Updated" value={formatDate(invoice.updatedAt)} />
              ) : null}
            </View>
          </View>

          {/* Financial Summary */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="attach-money" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Financial Summary
              </Text>
            </View>
            <View className="gap-3">
              <InfoRow
                icon="receipt"
                label="Subtotal"
                value={formatCurrency(subtotal, 'KES')}
              />
              {tax > 0 ? (
                <InfoRow icon="percent" label="Tax" value={formatCurrency(tax, 'KES')} />
              ) : null}
              {discount > 0 ? (
                <InfoRow
                  icon="local-offer"
                  label="Discount"
                  value={formatCurrency(discount, 'KES')}
                />
              ) : null}
              <View className="flex-row items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="account-balance-wallet" size={18} color="#7b1c1c" />
                  <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-100">
                    Total Amount
                  </Text>
                </View>
                <Text className="font-poppins text-xl font-bold text-brand-primary">
                  {formatCurrency(totalAmount, 'KES')}
                </Text>
              </View>
              {paidAmount > 0 ? (
                <View className="flex-row items-center justify-between pt-2">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={18} color="#059669" />
                    <Text className="font-inter text-base font-medium text-gray-900 dark:text-gray-100">
                      Paid Amount
                    </Text>
                  </View>
                  <Text className="font-inter text-lg font-semibold text-green-600">
                    {formatCurrency(paidAmount, 'KES')}
                  </Text>
                </View>
              ) : null}
              {remainingBalance > 0 ? (
                <View className="flex-row items-center justify-between pt-2">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="pending" size={18} color="#f59e0b" />
                    <Text className="font-inter text-base font-medium text-gray-900 dark:text-gray-100">
                      Remaining Balance
                    </Text>
                  </View>
                  <Text className="font-inter text-lg font-semibold text-yellow-600">
                    {formatCurrency(remainingBalance, 'KES')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Items Table */}
          {items.length > 0 ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="list" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Items ({items.length})
                </Text>
              </View>
              <View className="gap-3">
                {items.map((item: any, index: number) => {
                  const lineTotal = item.total || (item.quantity || 0) * (item.unitPrice || 0);
                  return (
                    <View
                      key={item._id || item.id || index}
                      className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                        {item.description || item.name || 'Item'}
                      </Text>
                      <View className="flex-row items-center justify-between gap-2 mt-2">
                        <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity || 0} × {formatCurrency(item.unitPrice || 0, 'KES')}
                        </Text>
                        <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(lineTotal, 'KES')}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Payment History */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="history" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                Payment History (Last 5)
              </Text>
            </View>
            {isLoadingPayments ? (
              <View className="py-4">
                <ActivityIndicator size="small" color="#7b1c1c" />
              </View>
            ) : payments.length === 0 ? (
              <View className="py-4">
                <Text className="font-inter text-sm text-gray-500 dark:text-gray-400 text-center">
                  No payments recorded yet
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {payments.map((payment: any, index: number) => {
                  const paymentId = payment._id || payment.id || index;
                  const paymentDate = payment.paymentDate || payment.createdAt;
                  const amount = payment.amount || 0;
                  const paymentMethod = payment.paymentMethod || 'N/A';
                  const paymentStatus = payment.status || 'completed';

                  return (
                    <View
                      key={paymentId}
                      className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <View className="flex-row items-center justify-between gap-2">
                        <View className="flex-1">
                          <Text className="font-inter text-base font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(amount, 'KES')}
                          </Text>
                          <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                            <View className="flex-row items-center gap-1">
                              <MaterialIcons name="payment" size={14} color="#6b7280" />
                              <Text className="font-inter text-xs text-gray-500 dark:text-gray-400">
                                {paymentMethod}
                              </Text>
                            </View>
                            {paymentStatus ? (
                              <Badge
                                variant={getPaymentStatusVariant(paymentStatus)}
                                size="sm"
                                icon={
                                  <MaterialIcons
                                    name={getPaymentStatusIcon(paymentStatus) as any}
                                    size={12}
                                    color={getPaymentStatusColor(paymentStatus)}
                                  />
                                }>
                                {paymentStatus.replace('_', ' ').toUpperCase()}
                              </Badge>
                            ) : null}
                          </View>
                        </View>
                        {paymentDate ? (
                          <Text className="font-inter text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(paymentDate)}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Notes */}
          {invoice.notes ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="note" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Notes
                </Text>
              </View>
              <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                {invoice.notes}
              </Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View className="gap-3">
            {/* Payment Button - Non-functional */}
            {remainingBalance > 0 && status !== 'cancelled' ? (
              <Pressable
                onPress={handlePayment}
                disabled={true}
                className="rounded-xl border-2 border-gray-400 bg-gray-100 px-6 py-4">
                <View className="flex-row items-center justify-center gap-2">
                  <MaterialIcons name="payment" size={20} color="#6b7280" />
                  <Text className="font-inter text-base font-semibold text-gray-500">
                    Make Payment (Coming Soon)
                  </Text>
                </View>
              </Pressable>
            ) : null}

            {/* Generate PDF Button */}
            <Pressable
              onPress={handleGeneratePDF}
              disabled={generatePDFMutation.isPending}
              className={`rounded-xl border-2 px-6 py-4 ${
                generatePDFMutation.isPending
                  ? 'border-gray-400 bg-gray-100'
                  : 'border-brand-primary bg-white active:bg-gray-50 dark:bg-gray-900 dark:active:bg-gray-800'
              }`}>
              {generatePDFMutation.isPending ? (
                <View className="flex-row items-center justify-center gap-2">
                  <ActivityIndicator size="small" color="#7b1c1c" />
                  <Text className="font-inter text-base font-semibold text-brand-primary">
                    Generating PDF...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center justify-center gap-2">
                  <MaterialIcons name="picture-as-pdf" size={20} color="#7b1c1c" />
                  <Text className="font-inter text-base font-semibold text-brand-primary">
                    Generate PDF
                  </Text>
                </View>
              )}
            </Pressable>
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
