## Payments Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Payment List UI](#payment-list-ui)
- [Payment Detail UI](#payment-detail-ui)
- [Initiate Payment UI](#initiate-payment-ui)
- [Payment Status UI](#payment-status-ui)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Socket.IO Implementation](#socketio-implementation)
- [Future Enhancements](#future-enhancements)

### Imports
The Payments screens reuse shared layout, themed helpers, badge components and TanStack Query hooks:

```tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import io, { Socket } from 'socket.io-client';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/utils';
import { API_BASE_URL } from '@/api/config';
import {
  useGetPayment,
  useInitiatePayment,
  useQueryMpesaStatus,
} from '@/tanstack/usePayments';
import { useGetInvoice, useGetInvoicePayments } from '@/tanstack/useInvoices';
import { useGetClientPayments } from '@/tanstack/usePayments';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
```

### Data Sources
- Primary API (see server docs `SIRE SERVER/SIRE-API/doc/PAYMENT_DOCUMENTATION.md`):
  - `GET /api/payments/:paymentId` (payment details)
  - `POST /api/payments/initiate` (initiate payment - M-Pesa or Paystack)
  - `GET /api/payments/mpesa-status/:checkoutRequestId` (query M-Pesa status)
  - `GET /api/payments/client/:clientId` (get client payments)
  - `GET /api/payments/invoice/:invoiceId` (get invoice payments)
  - `GET /api/invoices/:invoiceId` (invoice details for payment context)
- TanStack Query hooks:
  - `useGetPayment(paymentId)` for payment details
  - `useInitiatePayment()` for initiating M-Pesa/Paystack payments
  - `useQueryMpesaStatus(checkoutRequestId, options)` for M-Pesa status polling (fallback only)
  - `useGetClientPayments(clientId)` for all client payments
  - `useGetInvoicePayments(invoiceId)` for invoice-specific payments
  - `useGetInvoice(invoiceId)` for invoice context
- Socket.IO:
  - Real-time payment status updates via Socket.IO connection
  - Connection established on status page mount for both M-Pesa and Paystack
  - Connection options: `transports: ['websocket']`, `forceNew: true`, `timeout: 20000`, `reconnection: true`, `reconnectionAttempts: 5`, `reconnectionDelay: 1000`
  - Subscription via `subscribe-to-payment` event with payment ID
  - M-Pesa events: `callback.received`, `payment.updated`
  - Paystack events: `payment.updated`
  - 60-second timeout for M-Pesa, then fallback to API polling via `useQueryMpesaStatus`
  - API refetch triggered on socket connection to ensure latest payment data

### Hooks & State
- List screen:
  - Query params: `invoiceId` (optional, filters by invoice)
  - Local: `clientId` derived from `useAuth` and `useGetProfile`
  - Query: `useGetInvoicePayments(invoiceId)` if invoiceId present, otherwise `useGetClientPayments(clientId)`
  - Derived: `payments` memo from API response
- Details screen:
  - Param: `id` from route
  - Query: `useGetPayment(paymentId)`
- Initiate screen:
  - Query params: `invoiceId` (optional, pre-fills form)
  - Mutations: `useInitiatePayment()`
  - Local: `paymentMethod`, `phoneNumber`, `email`, `amount`, `invoiceId`, `inlineStatus`
  - Supporting queries: `useGetInvoice(invoiceId)` for invoice data and balance calculation
- Status screen:
  - Query params: `paymentId` (primary), `checkoutId` (optional, for M-Pesa)
  - Queries: `useGetPayment(paymentId)` with `refetch`, `useQueryMpesaStatus(checkoutId, { enabled: false })` (fallback only)
  - Socket.IO: Connection state, event listeners, timeout management, refs for socket and timers
  - Local state: `socketConnected`, `socketError`, `socketStatus`, `isFallbackActive`
  - Refs: `socketRef` (Socket instance), `timeoutRef` (fallback timeout), `pollingActiveRef`, `pollingIntervalRef`

### Payment List UI
- Card-based layout (NO tables) following invoice/quotation card patterns
- Each card displays:
  - Payment number (or fallback ID)
  - Amount (formatted currency)
  - Status badge with icon (pending, completed, failed, cancelled)
  - Payment method badge (M-Pesa or Paystack)
  - Payment date (formatted)
  - Invoice reference (if available)
  - Chevron icon for navigation
- Top section:
  - Page title: "Invoice Payments" (if invoiceId param present) or "All Payments"
  - Subtitle: "View your payment history"
- Pull-to-refresh functionality via `RefreshControl`
- Loading state: full-screen `Loading` component
- Error state: inline `Alert`
- Empty state: icon, message, and description
- Cards are clickable and navigate to payment detail page

### Payment Detail UI
- Header: Payment number, amount, status badge, payment method badge
- Cards:
  - Transaction Details: payment date, transaction reference, payment number
  - Invoice Reference: invoice number with link to invoice detail page
  - Payment Method Metadata:
    - M-Pesa: Phone number, checkout request ID, transaction reference
    - Paystack: Email, transaction reference, authorization code
  - Payment Status: current status with badge
- Action buttons:
  - Back to Invoice (if invoice available)
  - View Invoice (navigate to invoice detail)
- Pull-to-refresh functionality
- Utilizes `Badge`, `Alert`, `Loading`, `Themed` components for consistent look

### Initiate Payment UI
- Title: "Initiate Payment"
- Form fields:
  - `paymentMethod` (Picker: M-Pesa or Paystack, required)
  - `phoneNumber` (TextInput, required if M-Pesa, phone-pad keyboard)
  - `email` (TextInput, required if Paystack, email keyboard)
  - `amount` (TextInput, numeric, required)
  - `invoiceId` (pre-filled from route params, or can be selected if not provided)
- Invoice information card (if invoice selected):
  - Invoice number
  - Total amount
  - Paid amount
  - Remaining balance
- Amount validation:
  - Shows maximum payable amount (invoice balance)
  - Pre-fills amount with remaining balance
- Submit:
  - `useInitiatePayment()` to `POST /api/payments/initiate`
  - On success navigate to status page with `paymentId` and `checkoutId` (if M-Pesa)
- Action buttons:
  - Cancel (navigate back)
  - Initiate Payment (submit form)

### Payment Status UI
- Unified UI for both M-Pesa and Paystack
- Payment method badge (M-Pesa or Paystack)
- Current status display with loading indicator
- Amount and invoice reference
- Connection status display showing Socket.IO connection state
- M-Pesa flow:
  - Socket.IO connection established on mount
  - Subscribe to payment updates via `subscribe-to-payment` event
  - Listen for `callback.received` event (M-Pesa callback from Safaricom)
    - Handles both `CODE` (uppercase) and `code` (lowercase) fields in payload
    - Parses result code from string or number format
    - Validates result code presence before processing
  - Listen for `payment.updated` event (database updates)
  - Handle M-Pesa result codes (0 = success, 1 = insufficient balance, 1032 = cancelled, etc.)
  - If no response after 60 seconds: fallback to API polling using `useQueryMpesaStatus(checkoutId)`
  - Fallback queries Safaricom directly for payment status
- Paystack flow:
  - Socket.IO connection established on mount
  - Subscribe to payment updates via `subscribe-to-payment` event
  - Listen for `payment.updated` event (database updates)
  - Handle Paystack status values (`completed`, `PAID`, `failed`, `FAILED`)
- Socket.IO connection features:
  - Automatic reconnection (up to 5 attempts with 1 second delay)
  - Connection error handling with user feedback
  - API refetch on connection to ensure latest payment data
  - Clean disconnection on component unmount
- Action buttons:
  - View Details (navigate to payment detail page)
  - Retry (if failed, re-initiate payment)
- Status priority: Socket.IO status takes precedence over API status when available

### Navigation Flow
- Invoice Detail → "Make Payment" button → `/(authenticated)/payments/initiate?invoiceId=...`
- Invoice Detail → Payment History → "View More" → `/(authenticated)/payments?invoiceId=...`
- Invoice Detail → Payment History → Click payment → `/(authenticated)/payments/[id].tsx`
- Initiate Payment → Success → `/(authenticated)/payments/status?paymentId=...&checkoutId=...` (checkoutId only if M-Pesa)
- Payment Status → "View Details" → `/(authenticated)/payments/[paymentId]`
- Payment List → Click card → `/(authenticated)/payments/[id].tsx`
- Payment Detail → "View Invoice" → `/(authenticated)/invoices/[invoiceId]`

### Error & Loading States
- List:
  - Loading: full-screen `Loading` component
  - Error: inline `Alert` with error message
  - Empty: icon, message, and description
- Details:
  - Loading: full-screen `Loading` component
  - Error: inline `Alert` with error message
- Initiate:
  - Disable buttons while submitting
  - Inline success/error alerts
  - Safe retries
- Status:
  - Loading indicator during Socket.IO connection
  - Error alerts
  - Connection status display showing "Socket.IO Connected/Disconnected"
  - Fallback status indicator when API polling is active

### Socket.IO Implementation

#### Connection Setup
- Uses `socket.io-client` library
- Connects to `API_BASE_URL` from config
- Connection options:
  - `transports: ['websocket']` - Force WebSocket transport
  - `forceNew: true` - Create new connection each time
  - `timeout: 20000` - 20 second connection timeout
  - `reconnection: true` - Enable automatic reconnection
  - `reconnectionAttempts: 5` - Maximum reconnection attempts
  - `reconnectionDelay: 1000` - 1 second delay between attempts

#### Event Flow

**M-Pesa Events:**
1. `connect` - Socket.IO connection established
   - Emits `subscribe-to-payment` with payment ID
   - Should call `refetch()` from `useGetPayment` to get latest payment data via API
   - Sets `socketConnected` to `true` and clears `socketError`
2. `callback.received` - M-Pesa callback from Safaricom
   - Payload contains result code (as `CODE` uppercase or `code` lowercase) and `message`
   - Result code can be a number or string (parsed to number if string)
   - Handled by `handleMpesaResultCode()` function
   - Validates result code presence and logs warning if missing
   - Clears all timers when final status is received
3. `payment.updated` - Database payment update
   - Payload contains `paymentId` and `status`
   - Updates local `socketStatus` state if payment ID matches
   - Clears timers if status is `completed`, `failed`, or `cancelled`
4. `disconnect` - Socket.IO disconnected
   - Sets `socketConnected` to `false`
5. `connect_error` - Connection error occurred
   - Sets `socketError` to error message
   - Sets `socketConnected` to `false`

**Paystack Events:**
1. `connect` - Socket.IO connection established
   - Emits `subscribe-to-payment` with payment ID
   - Should call `refetch()` from `useGetPayment` to get latest payment data via API
   - Sets `socketConnected` to `true` and clears `socketError`
2. `payment.updated` - Database payment update
   - Payload contains `paymentId` and `status`
   - Handles status values: `completed`, `PAID`, `failed`, `FAILED`
   - Clears timers when payment reaches final state
3. `disconnect` - Socket.IO disconnected
   - Sets `socketConnected` to `false`
4. `connect_error` - Connection error occurred
   - Sets `socketError` to error message
   - Sets `socketConnected` to `false`

#### M-Pesa Result Codes
- Result codes are extracted from the callback payload, checking both `CODE` (uppercase) and `code` (lowercase) fields
- Codes can be received as numbers or strings (automatically parsed to numbers)
- Supported result codes:
  - `0` - Success (payment completed)
  - `1` - Insufficient M-Pesa balance
  - `1032` - Payment cancelled by user
  - `1037` - Payment timeout (could not reach phone)
  - `2001` - Wrong PIN entered
  - `1001` - Unable to complete transaction
  - `1019` - Transaction expired
  - `1025` - Invalid phone number
  - `1026` - System error occurred
  - `1036` - Internal error occurred
  - `1050` - Too many payment attempts
  - `9999` - Keep waiting (processing)
  - Any other code - Treated as failed with error message
- If result code is missing from payload, a warning is logged and the payment is treated as failed

#### Fallback Mechanism
- M-Pesa only: After 60 seconds (`FALLBACK_TIMEOUT`), if no Socket.IO update received
- Queries Safaricom directly via `useQueryMpesaStatus(checkoutId)`
- Parses result code from multiple possible fields: `resultCode`, `raw.ResultCode`, or `CODE`
- Handles both string and number formats (parses strings to numbers)
- Extracts result description from: `resultDesc`, `raw.ResultDesc`, `message`, or default message
- Updates payment status based on result code using same `handleMpesaResultCode()` function
- Clears all timers and disconnects socket after fallback completes

#### Cleanup
- `clearPaymentTimers()` function:
  - Clears timeout refs
  - Clears polling interval refs
  - Disconnects Socket.IO connection
  - Called on component unmount and when payment completes/fails

#### Dependencies
- `startTracking` useCallback dependencies:
  - `paymentId`, `isMpesa`, `checkoutId`
  - `clearPaymentTimers`, `handleMpesaResultCode`, `refetchMpesaStatus`
  - Note: `refetch` from `useGetPayment` should be included if used in connect handler
- `useEffect` dependencies for initialization:
  - `paymentId`, `isMpesa`, `checkoutId`, `startTracking`, `clearPaymentTimers`

### Mutation & Cache Behaviour
- `useInitiatePayment()` invalidates:
  - `['payments']`
  - Related invoice queries
- Payment completion triggers refetch of related invoice
- Success flows show success `Alert`, then navigate to status page
- Errors display backend messages from `error.response?.data?.message`

### Status Badge Configuration
- Status variants and icons:
  - `pending`: warning variant, hourglass-empty icon, yellow color
  - `processing`: info variant, sync icon, blue color
  - `completed`: success variant, check-circle icon, green color
  - `failed`: error variant, error icon, red color
  - `cancelled`: default variant, cancel icon, gray color
- Payment method badges:
  - `mpesa`: info variant, phone-android icon
  - `paystack`: default variant, credit-card icon
- Badge displays status text in uppercase with underscores replaced by spaces

### Future Enhancements
- Payment filtering by status or method
- Search functionality for payment numbers
- Payment export/download (PDF receipts)
- Payment reminders and notifications
- Recurring payment setup
- Payment analytics and history charts
- Multi-currency support
- Socket.IO room-based subscriptions for better scalability
- Payment status history timeline

