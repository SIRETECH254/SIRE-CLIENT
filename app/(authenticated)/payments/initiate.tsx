import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Alert } from '@/components/ui/Alert';
import { useInitiatePayment } from '@/tanstack/usePayments';
import { useGetInvoice } from '@/tanstack/useInvoices';
import { formatCurrency } from '@/utils';

type InlineStatus =
  | {
      type: 'success' | 'error';
      text: string;
    }
  | null;

type PaymentMethod = 'mpesa' | 'paystack';

export default function InitiatePaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ invoiceId?: string }>();
  const { mutateAsync, isPending } = useInitiatePayment();
  const invoiceIdFromParams = params.invoiceId || '';

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [inlineStatus, setInlineStatus] = useState<InlineStatus>(null);

  // Fetch invoice data when we have an invoiceId
  const { data: invoiceDataResponse } = useGetInvoice(invoiceIdFromParams);

  const invoiceData = useMemo(() => {
    if (!invoiceDataResponse) return null;
    const root = invoiceDataResponse?.data ?? invoiceDataResponse;
    return root?.data?.invoice ?? root?.invoice ?? root;
  }, [invoiceDataResponse]);

  // Pre-fill amount when invoice data is available
  useEffect(() => {
    if (invoiceData && !amount) {
      const totalAmount = invoiceData.totalAmount ?? invoiceData.total ?? 0;
      const paidAmount = invoiceData.paidAmount ?? 0;
      const remaining = Math.max(0, totalAmount - paidAmount);
      if (remaining > 0) {
        setAmount(String(remaining));
      }
    }
  }, [invoiceData, amount]);

  const isBusy = isPending;

  const handleSubmit = useCallback(async () => {
    const trimmedPhone = phoneNumber.trim();
    const trimmedEmail = email.trim();
    const trimmedAmount = amount.trim();

    if (!invoiceIdFromParams) {
      setInlineStatus({ type: 'error', text: 'Invoice ID is required.' });
      return;
    }

    if (paymentMethod === 'mpesa' && !trimmedPhone) {
      setInlineStatus({ type: 'error', text: 'Phone number is required for M-Pesa payments.' });
      return;
    }

    if (paymentMethod === 'paystack' && !trimmedEmail) {
      setInlineStatus({ type: 'error', text: 'Email is required for Paystack payments.' });
      return;
    }

    if (!trimmedAmount || Number(trimmedAmount) <= 0) {
      setInlineStatus({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }

    setInlineStatus(null);
    try {
      const payload: any = {
        invoiceId: invoiceIdFromParams,
        amount: Number(trimmedAmount),
        method: paymentMethod,
      };

      if (paymentMethod === 'mpesa') {
        payload.payerPhone = trimmedPhone;
      } else if (paymentMethod === 'paystack') {
        payload.payerEmail = trimmedEmail;
      }

      const result = await mutateAsync(payload);
      const success = result?.success ?? result?.data?.success ?? true;
      const responseData = result?.data ?? result;

      if (!success) {
        const message = result?.message || 'Payment initiation failed.';
        setInlineStatus({ type: 'error', text: message });
        return;
      }

      const paymentId = responseData?.paymentId ?? responseData?.payment?._id ?? responseData?.payment?.id;

      if (!paymentId) {
        setInlineStatus({ type: 'error', text: 'Payment ID not found in response.' });
        return;
      }

      setInlineStatus({ type: 'success', text: 'Payment initiated successfully.' });

      switch (paymentMethod) {
        case 'mpesa': {
          const checkoutId = responseData?.daraja?.checkoutRequestId ?? responseData?.checkoutRequestId;
          if (checkoutId) {
            router.replace(`/(authenticated)/payments/status?paymentId=${paymentId}&checkoutId=${checkoutId}` as any);
          } else {
            router.replace(`/(authenticated)/payments/status?paymentId=${paymentId}` as any);
          }
          break;
        }
        case 'paystack': {
          router.replace(`/(authenticated)/payments/status?paymentId=${paymentId}` as any);
          break;
        }
        default: {
          router.replace(`/(authenticated)/payments/status?paymentId=${paymentId}` as any);
          break;
        }
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Unable to initiate payment right now.';
      setInlineStatus({ type: 'error', text: message });
    }
  }, [paymentMethod, phoneNumber, email, amount, invoiceIdFromParams, mutateAsync, router]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  // Calculate invoice balance from fetched invoice data
  const invoiceTotal = invoiceData?.totalAmount ?? invoiceData?.total ?? 0;
  const invoicePaid = invoiceData?.paidAmount ?? 0;
  const invoiceBalance = Math.max(0, invoiceTotal - invoicePaid);

  if (!invoiceIdFromParams) {
    return (
      <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-6 py-8">
            <Alert variant="error" message="Invoice ID is required to initiate payment." className="w-full" />
            <Pressable onPress={handleCancel} className="btn btn-secondary mt-4">
              <Text className="btn-text btn-text-secondary">Go Back</Text>
            </Pressable>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 bg-slate-50 dark:bg-gray-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-6 py-8 gap-6">
          <ThemedText type="title" style={{ textAlign: 'center' }}>
        Initiate Payment
      </ThemedText>

          {/* Invoice Information Card */}
          {invoiceData && (
            <View className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <View className="flex-row items-center gap-2 mb-3">
                <MaterialIcons name="receipt" size={18} color="#7b1c1c" />
                <Text className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Invoice Information
                </Text>
              </View>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                    Invoice Number:
                  </Text>
                  <Text className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {invoiceData.invoiceNumber ?? 'N/A'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                    Total Amount:
                  </Text>
                  <Text className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(invoiceTotal)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="font-inter text-sm text-gray-600 dark:text-gray-400">
                    Paid Amount:
                  </Text>
                  <Text className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {formatCurrency(invoicePaid)}
                  </Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Text className="font-inter text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Remaining Balance:
                  </Text>
                  <Text className="font-inter text-sm font-semibold text-brand-primary">
                    {formatCurrency(invoiceBalance)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View className="gap-5">
            <View className="gap-2">
              <Text className="form-label">Payment Method *</Text>
              <View className="border border-gray-300 rounded-xl bg-white px-1">
                <Picker
                  selectedValue={paymentMethod}
                  onValueChange={(value: PaymentMethod) => {
                    setPaymentMethod(value);
                    setInlineStatus(null);
                  }}
                  style={{ height: 44 }}>
                  <Picker.Item label="M-Pesa" value="mpesa" />
                  <Picker.Item label="Paystack" value="paystack" />
                </Picker>
              </View>
            </View>

            {paymentMethod === 'mpesa' ? (
              <View className="gap-2">
                <Text className="form-label">Phone Number *</Text>
                <TextInput
                  value={phoneNumber}
                  onChangeText={(v) => {
                    setPhoneNumber(v);
                    setInlineStatus(null);
                  }}
                  placeholder="e.g. 254712345678"
                  className="form-input"
                  keyboardType="phone-pad"
                />
                <Text className="font-inter text-xs text-gray-500">
                  Enter phone number in international format (e.g., 254712345678)
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                <Text className="form-label">Email *</Text>
                <TextInput
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    setInlineStatus(null);
                  }}
                  placeholder="client@example.com"
                  className="form-input"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            )}

            <View className="gap-2">
              <Text className="form-label">Amount *</Text>
              <TextInput
                value={amount}
                onChangeText={(v) => {
                  setAmount(v);
                  setInlineStatus(null);
                }}
                placeholder="0.00"
                className="form-input"
                keyboardType="numeric"
              />
              {invoiceData && invoiceBalance > 0 && (
                <Text className="font-inter text-xs text-gray-500">
                  Maximum payable: {formatCurrency(invoiceBalance)}
                </Text>
              )}
            </View>
          </View>

          <View className="gap-3">
            {inlineStatus ? (
              <Alert variant={inlineStatus.type} message={inlineStatus.text} className="w-full" />
            ) : null}
            <View className="flex-row justify-end gap-3">
              <Pressable onPress={handleCancel} className="btn btn-secondary" disabled={isBusy}>
                <Text className="btn-text btn-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                className="btn btn-primary min-w-[150px]"
                disabled={isBusy}>
                {isBusy ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="btn-text btn-text-primary">Initiate Payment</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
