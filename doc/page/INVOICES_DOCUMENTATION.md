## Invoices Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Invoice List UI](#invoice-list-ui)
- [Invoice Detail UI](#invoice-detail-ui)
- [Actions & Notifications](#actions--notifications)
- [Filters, Search & Pagination](#filters-search--pagination)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Future Enhancements](#future-enhancements)

### Imports
Invoice screens reuse the shared layout, themed helpers, badge components and TanStack Query hooks:

```tsx
import React, { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
import {
  useGetClientInvoices,
  useGetInvoice,
  useGetInvoicePayments,
  useGenerateInvoicePDF,
} from '@/tanstack/useInvoices';
```

### Data Sources
- Primary API (see backend `SIRE SERVER/SIRE-API/doc/INVOICE_DOCUMENTATION.md`):
  - `GET /api/invoices/client/:clientId` (list client invoices)
  - `GET /api/invoices/:invoiceId` (details with linked quotation and payments)
  - `GET /api/invoices/:invoiceId/pdf` (generate PDF)
  - `GET /api/payments/invoice/:invoiceId` (payment history for invoice)
- TanStack Query hooks:
  - `useGetClientInvoices(clientId)` for list view
  - `useGetInvoice(invoiceId)` for detail screen
  - `useGetInvoicePayments(invoiceId)` for payment history
  - `useGenerateInvoicePDF()` mutation for PDF generation

### Hooks & State
- List screen:
  - Local: `clientId` derived from `useAuth` and `useGetProfile`.
  - Query: `useGetClientInvoices(clientId)` returning `{ data, isLoading, error, refetch, isRefetching }`.
  - Derived `invoices` memo from API response.
- Detail screen:
  - Param: `id` from route.
  - Queries: `useGetInvoice(invoiceId)`, `useGetInvoicePayments(invoiceId)`.
  - Local state: `successMessage`, `errorMessage` for user feedback.
  - Mutation: `useGenerateInvoicePDF()` for PDF generation.

### Invoice List UI
- Card-based layout following quotations pattern.
- Each card displays:
  - Invoice number (or fallback ID).
  - Project title.
  - Status badge with icon (draft, sent, paid, partially_paid, overdue, cancelled).
  - Total amount via `formatCurrency`.
  - Paid amount (if applicable).
  - Due date and created date formatted with `formatDate`.
  - Chevron icon for navigation.
- Top section:
  - Page title: "My Invoices".
  - Subtitle: "View and manage your invoices".
- Pull-to-refresh functionality via `RefreshControl`.
- Loading state: full-screen `Loading` component.
- Error state: inline `Alert`.
- Empty state: icon, message, and description.

### Invoice Detail UI
- Header: Invoice number, status badge with icon, project title.
- Cards:
  - Client & Project Information: client name, email, phone, company, project title.
  - Invoice Details: due date, paid date (if paid), created date, last updated.
  - Financial Summary:
    - Subtotal, tax, discount.
    - Total amount (highlighted).
    - Paid amount (if > 0, green).
    - Remaining balance (if > 0, yellow).
  - Items list: description, quantity × unit price, line total.
  - Payment History (Last 5): payment date, amount, payment method, status.
  - Notes section (if available).
- Action buttons:
  - Payment button (non-functional, disabled, "Coming Soon" text) - only shown if remaining balance > 0 and status not cancelled.
  - Generate PDF button (functional) - opens PDF in new tab/window.
- Pull-to-refresh functionality.
- Utilizes `Badge`, `Alert`, `Loading`, `Themed` components for consistent look.

### Actions & Notifications
- Actions trigger TanStack mutations:
  - Generate PDF → `useGenerateInvoicePDF` → opens PDF URL in new window.
- UI displays success/failure alerts and disables buttons while pending.
- Payment button is non-functional (placeholder for future implementation).

### Filters, Search & Pagination
- Currently no filters, search, or pagination implemented.
- All client invoices are displayed in a single list.
- Future enhancement: add pagination if invoice count grows.

### Mutation & Cache Behaviour
- `useGenerateInvoicePDF` mutation shows inline success `Alert` on completion.
- Errors display backend messages from `error.response?.data?.message`.
- Cache invalidation handled automatically by TanStack Query.
- `useGetInvoicePayments` caches payment history for 5 minutes.

### Navigation Flow
- Sidebar "Invoices" → `/(authenticated)/invoices/index.tsx`.
- Card press → `/(authenticated)/invoices/[id].tsx`.
- Back button on detail page → returns to list.

### Error & Loading States
- List:
  - Loading: full-screen `Loading` component.
  - Error: inline `Alert` with error message.
  - Empty: icon, message, and description.
- Detail:
  - Loading spinner via `Loading` component.
  - Inline alerts for API errors and success messages.
  - Disabled buttons while pending to avoid duplicate calls.
- Payment history:
  - Loading: `ActivityIndicator`.
  - Empty: centered message "No payments recorded yet".

### Status Badge Configuration
- Status variants and icons:
  - `draft`: default variant, draft icon, gray color.
  - `sent`: info variant, send icon, blue color.
  - `paid`: success variant, check-circle icon, green color.
  - `partially_paid`: warning variant, account-balance-wallet icon, yellow color.
  - `overdue`: error variant, warning icon, red color.
  - `cancelled`: default variant, cancel icon, gray color.
- Badge displays status text in uppercase with underscores replaced by spaces.

### Payment History Display
- Shows last 5 payments from `useGetInvoicePayments`.
- Each payment displays:
  - Amount (formatted currency).
  - Payment method.
  - Payment status.
  - Payment date (formatted).
- Empty state: "No payments recorded yet".
- Uses `formatCurrency` and `formatDate` utilities.

### Future Enhancements
- Functional payment button integration with payment gateway.
- Invoice filtering by status.
- Search functionality for invoice numbers.
- Pagination for large invoice lists.
- Invoice download/export options.
- Payment reminders and notifications.
- Invoice status change notifications.

