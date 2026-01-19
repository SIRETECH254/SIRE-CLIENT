# Contact Page Documentation

## Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [UI Structure](#ui-structure)
- [Form Fields](#form-fields)
- [API Integration](#api-integration)
- [Components Used](#components-used)
- [Error Handling](#error-handling)
- [Navigation Flow](#navigation-flow)
- [Functions Involved](#functions-involved)
- [Validation Rules](#validation-rules)
- [Future Enhancements](#future-enhancements)

## Imports
The Contact page uses React Native components, TanStack Query hooks, and shared UI components:

```tsx
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Alert } from '@/components/ui/Alert';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSubmitContactMessage } from '@/tanstack/useContact';
```

## Data Sources
- **Primary API** (see server docs `SIRE SERVER/SIRE-API/doc/CONTACT_DOCUMENTATION.md`):
  - `POST /api/contact` - Submit contact message (Public endpoint, no authentication required)
- **TanStack Query hooks:**
  - `useSubmitContactMessage()` - Mutation hook for submitting contact messages
  - Query key: `['contact', 'messages']` (invalidated on success)

## Hooks & State
- **Mutation:** `useSubmitContactMessage()` provides `mutateAsync`, `isPending`, `isError`, `error`
- **Local state:**
  - `name`: string - Contact name
  - `email`: string - Contact email
  - `phone`: string - Contact phone (optional)
  - `subject`: string - Message subject
  - `message`: string - Message content
  - `errors`: object - Field-specific validation errors
  - `inlineStatus`: string | null - Success/error message
  - `isSubmitting`: boolean - Submission state (derived from `isPending`)

## UI Structure
- **Layout:** `ThemedView` with `bg-slate-50 dark:bg-gray-950` background
- **Container:** `ScrollView` with `KeyboardAvoidingView` for mobile ergonomics
- **Form layout:**
  - Header section with title and description
  - Form fields in card-style container with rounded corners and shadow
  - Submit button with loading state
  - Success/error alert messages
- **Styling:** Admin-style, professional appearance with clean spacing and modern design

## Form Fields

### Name Field
- **Type:** Text input
- **Required:** Yes
- **Validation:** 
  - Required field
  - Max length: 100 characters
- **Props:**
  - `autoCapitalize="words"`
  - `placeholder="John Doe"`
  - `className="form-input"`

### Email Field
- **Type:** Email input
- **Required:** Yes
- **Validation:**
  - Required field
  - Valid email format
- **Props:**
  - `keyboardType="email-address"`
  - `autoCapitalize="none"`
  - `autoComplete="email"`
  - `placeholder="john@example.com"`
  - `className="form-input"`

### Phone Field
- **Type:** Phone input
- **Required:** No (optional)
- **Validation:**
  - Optional field
  - Valid phone format (if provided)
  - Max length: 20 characters
- **Props:**
  - `keyboardType="phone-pad"`
  - `placeholder="+254712345678"`
  - `className="form-input"`

### Subject Field
- **Type:** Text input
- **Required:** Yes
- **Validation:**
  - Required field
  - Max length: 200 characters
- **Props:**
  - `autoCapitalize="sentences"`
  - `placeholder="Inquiry about services"`
  - `className="form-input"`

### Message Field
- **Type:** Multiline text input
- **Required:** Yes
- **Validation:**
  - Required field
  - Min length: 10 characters
  - Max length: 2000 characters
- **Props:**
  - `multiline={true}`
  - `numberOfLines={6}`
  - `textAlignVertical="top"`
  - `placeholder="I would like to know more about your services..."`
  - `className="form-input"`
- **Features:**
  - Character counter showing current length and limits (10-2000)
  - Visual feedback when approaching limits

## API Integration

### Endpoint
- **URL:** `POST /api/contact`
- **Access:** Public (no authentication required)
- **Headers:** `Content-Type: application/json`

### Request Payload
```typescript
{
  name: string;        // Required, max 100 chars
  email: string;       // Required, valid email format
  phone?: string;      // Optional, valid phone format, max 20 chars
  subject: string;     // Required, max 200 chars
  message: string;     // Required, 10-2000 chars
}
```

### Response Structure
**Success (201):**
```json
{
  "success": true,
  "message": "Contact message submitted successfully. We will get back to you soon!",
  "data": {
    "contactMessage": {
      "id": "...",
      "name": "John Doe",
      "subject": "Inquiry about services",
      "status": "unread",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Name, email, subject, and message are required"
}
```

### Hook Usage
```tsx
const submitMutation = useSubmitContactMessage();

const handleSubmit = async () => {
  try {
    const result = await submitMutation.mutateAsync({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
    });
    
    // Handle success
    setInlineStatus('success');
    resetForm();
  } catch (error: any) {
    // Handle error
    const errorMessage = error.response?.data?.message || 'Failed to submit message';
    setInlineStatus(errorMessage);
  }
};
```

## Components Used
- **View, ScrollView, KeyboardAvoidingView** - Layout components
- **Text, TextInput** - Form elements
- **Pressable** - Interactive buttons
- **ActivityIndicator** - Loading state
- **Alert** - Success/error messages
- **ThemedText, ThemedView** - Themed components
- **MaterialIcons** - Icons (optional, for visual enhancements)

## Error Handling

### Client-Side Validation
- **Field-level errors:** Displayed inline below each field
- **Error clearing:** Errors cleared when user starts typing in the field
- **Validation timing:** 
  - On blur for individual fields
  - On submit for all fields

### Server Error Handling
- **Network errors:** Generic error message with retry suggestion
- **Validation errors:** Display backend error message
- **400 Bad Request:** Show specific validation message from API
- **500 Server Error:** Generic error message

### Error Display
- **Inline errors:** Red text below each field
- **Global errors:** Alert component with error variant
- **Success messages:** Alert component with success variant

## Navigation Flow
- **Route:** `/(public)/contact`
- **Access:** Public (no authentication required)
- **Navigation:**
  - Can be accessed from public navigation menu
  - No redirects required
  - After successful submission, form resets and shows success message

## Functions Involved

### `handleInputChange(field: string, value: string)`
**Purpose:** Update field value and clear related errors
```tsx
const handleInputChange = useCallback((field: string, value: string) => {
  switch (field) {
    case 'name':
      setName(value);
      if (errors.name) setErrors(prev => ({ ...prev, name: null }));
      break;
    // ... other fields
  }
  if (inlineStatus) setInlineStatus(null);
}, [errors, inlineStatus]);
```

### `validateForm()`
**Purpose:** Validate all form fields before submission
```tsx
const validateForm = useCallback(() => {
  const newErrors: Record<string, string | null> = {};
  
  if (!name.trim()) {
    newErrors.name = 'Name is required';
  } else if (name.length > 100) {
    newErrors.name = 'Name cannot exceed 100 characters';
  }
  
  // ... other validations
  
  setErrors(newErrors);
  return Object.values(newErrors).every(err => !err);
}, [name, email, phone, subject, message]);
```

### `handleSubmit()`
**Purpose:** Validate and submit contact form
```tsx
const handleSubmit = useCallback(async () => {
  if (!validateForm()) {
    return;
  }
  
  setIsSubmitting(true);
  setInlineStatus(null);
  
  try {
    await submitMutation.mutateAsync({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
    });
    
    setInlineStatus('success');
    resetForm();
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to submit message';
    setInlineStatus(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
}, [name, email, phone, subject, message, validateForm, submitMutation]);
```

### `resetForm()`
**Purpose:** Reset all form fields and errors after successful submission
```tsx
const resetForm = useCallback(() => {
  setName('');
  setEmail('');
  setPhone('');
  setSubject('');
  setMessage('');
  setErrors({});
  setInlineStatus(null);
}, []);
```

## Validation Rules

### Name
- **Required:** Yes
- **Max length:** 100 characters
- **Format:** Any text

### Email
- **Required:** Yes
- **Format:** Valid email address (regex: `/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/`)
- **Case:** Converted to lowercase before submission

### Phone
- **Required:** No
- **Format:** Valid phone number (regex: `/^[\+]?[1-9][\d]{0,15}$/`)
- **Max length:** 20 characters

### Subject
- **Required:** Yes
- **Max length:** 200 characters

### Message
- **Required:** Yes
- **Min length:** 10 characters
- **Max length:** 2000 characters

## Future Enhancements
- Add reCAPTCHA or similar spam protection
- Add file attachment support (if backend supports it)
- Add contact information display (address, phone, email)
- Add map integration for location
- Add social media links
- Add auto-save draft functionality
- Add email confirmation to sender
- Add estimated response time information
- Add FAQ section or help text
- Add form analytics tracking

