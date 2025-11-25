import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceAPI, paymentAPI } from '@/api';

// Get client invoices
export const useGetClientInvoices = (clientId: string) => {
  return useQuery({
    queryKey: ['invoices', 'client', clientId],
    queryFn: async () => {
      const response = await invoiceAPI.getClientInvoices(clientId);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Get single invoice
export const useGetInvoice = (invoiceId: string) => {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const response = await invoiceAPI.getInvoice(invoiceId);
      return response.data;
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get invoice payments
export const useGetInvoicePayments = (invoiceId: string) => {
  return useQuery({
    queryKey: ['payments', 'invoice', invoiceId],
    queryFn: async () => {
      const response = await paymentAPI.getInvoicePayments(invoiceId);
      return response.data;
    },
    enabled: !!invoiceId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Generate invoice PDF
export const useGenerateInvoicePDF = () => {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await invoiceAPI.generateInvoicePDF(invoiceId);
      return response.data;
    },
    onError: (error: any) => {
      console.error('Generate invoice PDF error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate invoice PDF';
      console.error('Error:', errorMessage);
    },
  });
};
