## Profile Screen Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Profile Overview UI](#profile-overview-ui)
- [Edit Profile UI](#edit-profile-ui)
- [Change Password UI](#change-password-ui)
- [Form Fields](#form-fields)
- [Mutation & Cache Behaviour](#mutation--cache-behaviour)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Future Enhancements](#future-enhancements)

### Imports
Both profile screens rely on shared layout, themed helpers and TanStack Query hooks:

```tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';

import { useGetProfile, useUpdateProfile, useChangePassword } from '@/tanstack/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { updateUser } from '@/redux/slices/authSlice';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { getInitials, formatDate, getRoleNames } from '@/utils';
```

### Data Sources
- **Primary API**: `GET /api/users/profile` & `PUT /api/users/profile` (see `API_DOCUMENTATION.md`).
- **TanStack Query hooks**: `useGetProfile()` returns the latest profile payload; `useUpdateProfile()` wraps the update mutation; `useChangePassword()` handles password changes.
- **Redux/Auth context**: `useAuth()` exposes the persisted auth user shape so the screen can show optimistic values while network requests resolve.

### Hooks & State
- `useGetProfile()` powers the read view. Response shape: `{ success, data: { user } }`.
  - Query key: `['user', 'profile']`
  - Uses `userAPI.getProfile()` endpoint
- `useUpdateProfile()` handles form submission, invalidates the profile query and logs success.
  - Mutation function accepts FormData (for avatar) or JSON payload
  - Invalidates `['user', 'profile']` query on success
- `useChangePassword()` handles password change with validation.
  - Mutation function accepts `{ currentPassword, newPassword }`
- `useAuth()` supplies `user` (for initial values, initials fallback) and `logout()`.
- `useDispatch()` (Redux) lets the edit screen call `updateUser` once the mutation resolves.
- Local component state & helpers:
  - `inlineStatus`: success / error messaging for the edit form.
  - `firstName`, `lastName`, `phone`: controlled inputs, initialised via `useEffect` whenever `profile` changes.
  - `avatarUri`: string pointing at the preview image (server-hosted or locally picked).
  - `avatarFile`: `{ uri, name, type }` payload ready for `FormData` uploads (native only).
  - `avatarRemoved`: boolean flag that indicates the user cleared their avatar; drives `avatar: null` payloads.
  - `isBusy`: derived from the mutation's `isPending` flag.
  - `initials`, `currentAvatar`: memoised fallbacks used across both overview and edit UIs.

### Profile Overview UI
- Overall layout: `ThemedView` with `bg-slate-50 dark:bg-gray-950` background → `ScrollView` with `RefreshControl` for pull-to-refresh.
- Header section includes:
  - Circular avatar (image if `user.avatar`, otherwise initials badge with `bg-brand-tint`).
  - Name display with role and status badges.
  - "Edit Profile" button.
- Information cards with `rounded-2xl border border-gray-200 bg-white shadow-sm` styling:
  - **Contact Information** card: Email, Phone using `ProfileRow` component with MaterialIcons.
  - **Account Details** card: Role (Badge), Status (Badge), Email Verified (Badge), Created date, Updated date.
- Uses `Badge` component for role, status, and email verification display.
- Uses `Alert` component for error messages.
- Uses `Loading` component for full-screen loading state.
- Primary CTAs: "Edit Profile" button navigates to `/(authenticated)/profile/edit`; "Change Password" button navigates to `/(authenticated)/profile/change-password` via `useRouter().push`.
- Loading overlay uses `Loading` component. Errors display inline `Alert` components to keep context on screen.

### Edit Profile UI
- Screen title: "Edit Profile". Uses `KeyboardAvoidingView` + `ScrollView` for mobile ergonomics.
- Background: `bg-slate-50 dark:bg-gray-950`.
- Avatar picker block:
  - Larger avatar size: `h-28 w-28` with `border-4 border-white shadow-md`.
  - `Pressable` opens the system library via Expo `ImagePicker`.
  - "Tap to change avatar" text below avatar.
  - Successful selection updates the preview immediately and stores the file metadata for submission.
  - A "Remove avatar" CTA appears when an avatar exists (either from the API or a newly picked file). Tapping it clears local state and sends `avatar: null` on save.
- Form inputs:
  - `TextInput` for `firstName`, `lastName`, `phone` (phone optional per backend schema).
  - Email shown but locked for editing (disabled field with `form-input-disabled` styling).
  - Validation ensures required fields (`firstName`, `lastName`) and basic phone trimming.
- Action row (aligned to the right):
  - "Cancel" → `router.back()`.
  - "Save changes" triggers `useUpdateProfile().mutateAsync`.
  - Loading state shows `ActivityIndicator` and disables buttons.
- Uses `Alert` component for status messages.

### Change Password UI
- Screen title: "Change Password". Uses `KeyboardAvoidingView` + `ScrollView` for mobile ergonomics.
- Form inputs:
  - `TextInput` for `currentPassword` (required, secureTextEntry).
  - `TextInput` for `newPassword` (required, secureTextEntry).
  - `TextInput` for `confirmPassword` (required, secureTextEntry).
  - Password visibility toggles for each field using MaterialIcons.
- Validation:
  - Required fields: currentPassword, newPassword, confirmPassword.
  - New password minimum length (6 characters per backend).
  - Confirm password must match new password.
  - Current password cannot be same as new password.
- Action row:
  - "Cancel" → `router.back()`.
  - "Change Password" triggers `useChangePassword().mutateAsync`.
  - Loading state shows `ActivityIndicator` and disables buttons.
- Success/error messages displayed inline.

### Form Fields
| Field | API Key | Behaviour |
| --- | --- | --- |
| First Name | `firstName` | Required. Trimmed before submission. |
| Last Name | `lastName` | Required. Trimmed before submission. |
| Email | `email` | Read-only in UI to avoid accidental changes. |
| Phone | `phone` | Optional. Normalised by trimming whitespace. |
| Avatar | `avatar` | Tap to pick a new image; native builds send multipart `FormData`, web fetches the blob before append. Removing the avatar sends `avatar: null`. |
| Current Password | `currentPassword` | Required for password change. |
| New Password | `newPassword` | Required, minimum 6 characters. |
| Confirm Password | `confirmPassword` | Required, must match new password. |

### Mutation & Cache Behaviour
- On success the mutation handler:
  - Invalidates `['user', 'profile']` query (handled inside hook).
  - Dispatches `updateUser(updatedUser)` to refresh Redux/auth state so headers reflect the new avatar and name without a relog.
  - Shows a success message and navigates back after a short delay.
- Payload logic:
  - When `avatarFile` is present the screen builds a `FormData` payload (`firstName`, `lastName`, optional `phone`, `avatar` file).
  - Web targets fetch the local URI first (to obtain a `Blob`) before appending.
  - When the user removes the avatar the mutation sends JSON `{ avatar: null, firstName, lastName, phone? }`.
- On error the inline status block renders the backend message from `error.response?.data?.message`.

### Navigation Flow
- `/(authenticated)/profile/index.tsx` loads on sidebar "Profile" or header dropdown "View Profile".
- Pressing "Edit Profile" pushes to `/(authenticated)/profile/edit`.
- Pressing "Change Password" pushes to `/(authenticated)/profile/change-password`.
- Successful save pops back to the overview. Cancel also calls `router.back()`.
- If an unauthenticated user is detected, the parent layout already redirects to login via the `AuthenticatedLayout` guard.

### Error & Loading States
- Read screen: `Loading` component spinner during initial fetch; inline `Alert` with error styling if the API request fails.
- Edit screen: disables CTA while submitting; shows inline success/error messages using `Alert` component above the buttons; safe to retry without leaving the screen.
- Change password screen: disables CTA while submitting; shows inline success/error messages; navigates back on success.
- Network failures do not mutate stored profile — the UI keeps previous values until a successful response arrives.

### UI Components Used
- **Badge**: Used for displaying role, status, and email verification status with variants (`success`, `error`, `warning`, `info`).
- **Alert**: Used for displaying success and error messages with variants (`success`, `error`, `info`).
- **Loading**: Used for full-screen loading states.
- **ProfileRow**: Custom component for displaying profile information with icons.

### Utility Functions
- **`getInitials(user)`**: Generates user initials from firstName/lastName or email fallback.
- **`formatDate(dateString)`**: Formats date strings using Intl.DateTimeFormat.
- **`getRoleNames(user)`**: Extracts role names from user object (supports both old `role` and new `roles` array format).

### Future Enhancements
- Add proper phone number masking and validation.
- Display audit history (last login, last password change) once exposed by the API.
- Consider optimistic updates by writing directly to the profile query cache when backend latency is high.
- Support camera capture in addition to library selection for the avatar picker.
- Add password strength indicator for new password field.
- Add pull-to-refresh to edit profile screen.
