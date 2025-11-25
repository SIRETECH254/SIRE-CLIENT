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
  useGetQuotation,
  useAcceptQuotation,
  useRejectQuotation,
  useGenerateQuotationPDF,
} from '@/tanstack/useQuotations';

export default function QuotationDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const quotationId = id || '';

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetQuotation(quotationId);

  const acceptMutation = useAcceptQuotation();
  const rejectMutation = useRejectQuotation();
  const generatePDFMutation = useGenerateQuotationPDF();

  const quotation = useMemo(() => {
    return data?.data?.quotation || data?.quotation || data?.data || data || null;
  }, [data]);

  const errorMsg =
    (error as any)?.response?.data?.message ??
    (error as Error)?.message ??
    'Failed to load quotation details';

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

  const canAcceptOrReject = useMemo(() => {
    const status = quotation?.status?.toLowerCase();
    return status === 'pending' || status === 'sent';
  }, [quotation?.status]);

  const handleAccept = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await acceptMutation.mutateAsync(quotationId);
      setSuccessMessage('Quotation accepted successfully');
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to accept quotation';
      setErrorMessage(msg);
    }
  };

  const handleReject = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await rejectMutation.mutateAsync(quotationId);
      setSuccessMessage('Quotation rejected successfully');
      refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to reject quotation';
      setErrorMessage(msg);
    }
  };

  const handleGeneratePDF = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await generatePDFMutation.mutateAsync(quotationId);
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

  if (isLoading && !quotation) {
    return <Loading fullScreen message="Loading quotation details..." />;
  }

  if (!quotation) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-6 py-8">
            <Alert variant="error" message={errorMsg || 'Quotation not found'} className="w-full" />
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

  const status = quotation.status || 'draft';
  const items = quotation.items || [];
  const client = quotation.client || {};
  const project = quotation.project || {};
  const subtotal = quotation.subtotal || 0;
  const tax = quotation.tax || 0;
  const discount = quotation.discount || 0;
  const total = quotation.total || 0;

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
              {quotation.quotationNumber || `Quotation #${quotationId?.slice(-6) || 'N/A'}`}
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
              {project.title || project.name ? (
                <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                  • {project.title || project.name}
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
          {(client.name || client.email || project.title) ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="person" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Client & Project Information
                </Text>
              </View>
              <View className="gap-3">
                {client.name ? (
                  <InfoRow icon="person" label="Client Name" value={client.name} />
                ) : null}
                {client.email ? (
                  <InfoRow icon="mail-outline" label="Email" value={client.email} />
                ) : null}
                {client.phone ? (
                  <InfoRow icon="call" label="Phone" value={client.phone} />
                ) : null}
                {project.title || project.name ? (
                  <InfoRow
                    icon="folder"
                    label="Project"
                    value={project.title || project.name || 'N/A'}
                  />
                ) : null}
                {project.projectNumber ? (
                  <InfoRow icon="tag" label="Project Number" value={project.projectNumber} />
                ) : null}
              </View>
            </View>
          ) : null}

          {/* Quotation Metadata */}
          <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <View className="flex-row items-center gap-2 mb-3">
              <MaterialIcons name="info" size={20} color="#7b1c1c" />
              <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
        Quotation Details
              </Text>
            </View>
            <View className="gap-3">
              {quotation.issueDate ? (
                <InfoRow icon="event" label="Issue Date" value={formatDate(quotation.issueDate)} />
              ) : null}
              {quotation.validUntil ? (
                <InfoRow
                  icon="event-available"
                  label="Valid Until"
                  value={formatDate(quotation.validUntil)}
                />
              ) : null}
              {quotation.createdAt ? (
                <InfoRow
                  icon="schedule"
                  label="Created"
                  value={formatDate(quotation.createdAt)}
                />
              ) : null}
              {quotation.updatedAt ? (
                <InfoRow
                  icon="update"
                  label="Last Updated"
                  value={formatDate(quotation.updatedAt)}
                />
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
                    Total
                  </Text>
                </View>
                <Text className="font-poppins text-xl font-bold text-brand-primary">
                  {formatCurrency(total, 'KES')}
                </Text>
              </View>
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
                  const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
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

          {/* Notes */}
          {quotation.notes ? (
            <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="note" size={20} color="#7b1c1c" />
                <Text className="font-poppins text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Notes
                </Text>
              </View>
              <Text className="font-inter text-base text-gray-700 dark:text-gray-300">
                {quotation.notes}
              </Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View className="gap-3">
            {/* Generate PDF Button - Always visible */}
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

            {/* Accept/Reject Buttons - Only for pending/sent status */}
            {canAcceptOrReject ? (
              <>
                <Pressable
                  onPress={handleAccept}
                  disabled={acceptMutation.isPending || rejectMutation.isPending}
                  className={`rounded-xl px-6 py-4 ${
                    acceptMutation.isPending
                      ? 'bg-gray-400'
                      : 'bg-green-600 active:bg-green-700'
                  }`}>
                  {acceptMutation.isPending ? (
                    <View className="flex-row items-center justify-center gap-2">
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text className="font-inter text-base font-semibold text-white">
                        Accepting...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-center gap-2">
                      <MaterialIcons name="check-circle" size={20} color="#ffffff" />
                      <Text className="font-inter text-base font-semibold text-white">
                        Accept Quotation
                      </Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  onPress={handleReject}
                  disabled={acceptMutation.isPending || rejectMutation.isPending}
                  className={`rounded-xl px-6 py-4 ${
                    rejectMutation.isPending
                      ? 'bg-gray-400'
                      : 'bg-red-600 active:bg-red-700'
                  }`}>
                  {rejectMutation.isPending ? (
                    <View className="flex-row items-center justify-center gap-2">
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text className="font-inter text-base font-semibold text-white">
                        Rejecting...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-center gap-2">
                      <MaterialIcons name="cancel" size={20} color="#ffffff" />
                      <Text className="font-inter text-base font-semibold text-white">
                        Reject Quotation
                      </Text>
                    </View>
                  )}
                </Pressable>
              </>
            ) : null}
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
