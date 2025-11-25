## Quotations Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Quotations List UI](#quotations-list-ui)
- [Quotation Detail UI](#quotation-detail-ui)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Future Enhancements](#future-enhancements)

### Imports
The Quotations screens reuse shared layout, themed helpers, and TanStack Query hooks:

```tsx
import React, { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatCurrency, formatDate } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
import {
  useGetClientQuotations,
  useGetQuotation,
  useAcceptQuotation,
  useRejectQuotation,
} from '@/tanstack/useQuotations';
```

### Data Sources
- Primary API (see server docs `SIRE-API/doc/QUOTATION_DOCUMENTATION.md`):
  - `GET /api/quotations` (with clientId filter) - list client's quotations
  - `GET /api/quotations/:quotationId` (details)
  - `POST /api/quotations/:quotationId/accept` (accept quotation)
  - `POST /api/quotations/:quotationId/reject` (reject quotation)
- TanStack Query hooks:
  - `useGetClientQuotations(clientId)` for list
  - `useGetQuotation(quotationId)` for details
  - `useAcceptQuotation()` for accepting quotations
  - `useRejectQuotation()` for rejecting quotations
- All financial displays are rendered in **Kenyan Shillings (KES)** to match backend calculations

### Hooks & State
- **List screen**:
  - Local: None (simplified for clients)
  - Query: `useGetProfile()` to get clientId, then `useGetClientQuotations(clientId)` providing `{ data, isLoading, error, refetch, isRefetching }`
  - Derived: `clientId` from user profile (`user?._id || user?.id`)
- **Detail screen**:
  - Param: `id` from route
  - Query: `useGetQuotation(quotationId)` providing `{ data, isLoading, error }`
  - Mutations: `useAcceptQuotation()`, `useRejectQuotation()`
  - Local: `isAccepting`, `isRejecting` for button disabled states

### Quotations List UI
- Card-based list (not table) using React Native `ScrollView`:
  - Each card displays:
    - Quotation number (header)
    - Project name (if linked)
    - Total amount (KES) with currency formatting
    - Status badge (draft, pending, sent, accepted, rejected, converted)
    - Valid until date
    - Created date
  - Cards are pressable and navigate to detail page
- Pull-to-refresh functionality using `RefreshControl`
- Loading state: Skeleton cards (3-5 cards with gray background and rounded corners)
- Error state: Full-width `Alert` component with error message
- Empty state: Centered message "No quotations found" with helpful text

### Quotation Detail UI
- Quotation header section:
  - Quotation number
  - Status badge with icon
  - Project name (if linked)
- Client & Project info card (read-only):
  - Client name, email, phone
  - Project title and number
- Quotation metadata card:
  - Issue date
  - Valid until date
  - Created/updated dates
- Financial summary card:
  - Subtotal
  - Tax amount
  - Discount amount
  - Total (all in KES using `formatCurrency`)
- Items table:
  - Description, quantity, unit price, line total
  - Summary rows for tax, discount, grand total
- Notes section (if available)
- Action buttons:
  - "Accept Quotation" button (only for pending/sent status)
  - "Reject Quotation" button (only for pending/sent status)
  - Disabled state when already accepted/rejected/converted
  - Loading state during mutation
- Success/error feedback using `Alert` component

### Navigation Flow
- Sidebar "Quotations" → `/(authenticated)/quotations/index.tsx`
- Header "Quotations" → `/(authenticated)/quotations/index.tsx`
- Quotation card press → `/(authenticated)/quotations/[id].tsx`
- Accept/Reject actions stay on detail page with feedback

### Error & Loading States
- **List**:
  - Loading: Skeleton cards (3-5 cards) with gray background
  - Error: Full-width `Alert` component with error message from `error.response?.data?.message`
  - Empty: Centered "No quotations found" message
- **Detail**:
  - Loading: `Loading` component (fullScreen)
  - Error: `Alert` component with error message and back navigation
- **Accept/Reject Actions**:
  - Loading: Disabled buttons with loading indicator
  - Error: `Alert` component with error message
  - Success: `Alert` component with success message, cache invalidation, and status update

### Mutation & Cache Behaviour
- `useAcceptQuotation()` invalidates:
  - `['quotations']`
  - `['quotation', quotationId]`
- `useRejectQuotation()` invalidates:
  - `['quotations']`
  - `['quotation', quotationId]`
- Success flows show success `Alert`, then refresh data
- Errors display backend messages from `error.response?.data?.message`

### Status Badge Variants
- `pending` → warning variant (yellow) with `hourglass-empty` icon
- `sent` → info variant (blue) with `send` icon
- `accepted` → success variant (green) with `check-circle` icon
- `rejected` → error variant (red) with `cancel` icon
- `converted` → default variant (gray) with `transform` icon
- `draft` → default variant (gray) with `draft` icon

### Key Differences from Admin Module
- **List View**: Card-based list instead of table
- **No Filters/Search**: Simplified UI for clients
- **No Create/Edit**: Clients can only view and accept/reject
- **No Convert/Send**: Only admin actions
- **Client-Specific**: Only shows quotations for the logged-in client
- **Simplified Detail View**: Focus on viewing and accepting/rejecting
- **No PDF Download**: Admin-only feature (future enhancement)

### Future Enhancements
- Search functionality for quotations list
- Filter by status (pending, sent, accepted, rejected)
- Sort quotations by date, amount, or status
- PDF download/view functionality
- Email notifications for quotation status changes
- Quotation history/activity timeline
- Comments/notes from client on quotations

