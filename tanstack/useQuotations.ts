import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationAPI } from '@/api';

// Get single quotation
export const useGetQuotation = (quotationId: string) => {
  return useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: async () => {
      const response = await quotationAPI.getQuotation(quotationId);
      return response.data;
    },
    enabled: !!quotationId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Get client quotations
export const useGetClientQuotations = (clientId: string) => {
  return useQuery({
    queryKey: ['quotations', 'client', clientId],
    queryFn: async () => {
      const response = await quotationAPI.getClientQuotations(clientId);
      return response.data;
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Accept quotation (client)
export const useAcceptQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await quotationAPI.acceptQuotation(quotationId);
      return response.data;
    },
    onSuccess: (data, quotationId) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      console.log('Quotation accepted successfully');
    },
    onError: (error: any) => {
      console.error('Accept quotation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to accept quotation';
      console.error('Error:', errorMessage);
    },
  });
};

// Reject quotation (client)
export const useRejectQuotation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await quotationAPI.rejectQuotation(quotationId);
      return response.data;
    },
    onSuccess: (data, quotationId) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', quotationId] });
      console.log('Quotation rejected successfully');
    },
    onError: (error: any) => {
      console.error('Reject quotation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to reject quotation';
      console.error('Error:', errorMessage);
    },
  });
};

// Generate quotation PDF (client)
export const useGenerateQuotationPDF = () => {
  return useMutation({
    mutationFn: async (quotationId: string) => {
      const response = await quotationAPI.generateQuotationPDF(quotationId);
      return response.data;
    },
    onError: (error: any) => {
      console.error('Generate quotation PDF error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate quotation PDF';
      console.error('Error:', errorMessage);
    },
  });
};
