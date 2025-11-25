## Projects Module Documentation

### Table of Contents
- [Imports](#imports)
- [Data Sources](#data-sources)
- [Hooks & State](#hooks--state)
- [Projects List UI](#projects-list-ui)
- [Project Detail UI](#project-detail-ui)
- [Attach Assets UI](#attach-assets-ui)
- [Navigation Flow](#navigation-flow)
- [Error & Loading States](#error--loading-states)
- [Future Enhancements](#future-enhancements)

### Imports
The Projects screens reuse shared layout, themed helpers, and TanStack Query hooks:

```tsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';

import { Alert } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { Badge } from '@/components/ui/Badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getInitials, formatDate } from '@/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useGetProfile } from '@/tanstack/useUsers';
import {
  useGetClientProjects,
  useGetProject,
  useUploadAttachment,
  useDeleteAttachment,
} from '@/tanstack/useProjects';
```

### Data Sources
- Primary API (see server docs `SIRE-API/doc/PROJECT_DOCUMENTATION.md`):
  - `GET /api/projects/client/:clientId` (list client's projects)
  - `GET /api/projects/:projectId` (details)
  - `POST /api/projects/:projectId/attachments` (upload attachment)
  - `DELETE /api/projects/:projectId/attachments/:attachmentId` (delete attachment)
- TanStack Query hooks:
  - `useGetClientProjects(clientId)` for list
  - `useGetProject(projectId)` for details
  - `useUploadAttachment()` for uploading attachments
  - `useDeleteAttachment()` for deleting attachments

### Hooks & State
- List screen:
  - Local: None (simplified for clients)
  - Query: `useGetProfile()` to get clientId, then `useGetClientProjects(clientId)` providing `{ data, isLoading, error, refetch, isRefetching }`
  - Derived: `clientId` from user profile (`user?._id || user?.id`)
- Detail screen:
  - Param: `id` from route
  - Query: `useGetProject(projectId)` providing `{ data, isLoading, error }`
- Attach Assets screen:
  - Param: `id` from route
  - Query: `useGetProject(projectId)` to get attachments array
  - Mutations: `useUploadAttachment()`, `useDeleteAttachment()`
  - Local: `uploading`, `deletingId`, `selectedFile`

### Projects List UI
- Card-based list (not table) using React Native `ScrollView`:
  - Each card displays:
    - Project number/title (header)
    - Status badge (pending, in_progress, on_hold, completed, cancelled)
    - Priority badge (low, medium, high, urgent)
    - Progress bar with percentage
    - Client name (if available)
    - Start date and end date
    - Created date
  - Cards are pressable and navigate to detail page
- Pull-to-refresh functionality using `RefreshControl`
- Loading state: Skeleton cards (3-5 cards with gray background and rounded corners)
- Error state: Full-width `Alert` component with error message
- Empty state: Centered message "No projects found" with helpful text

### Project Detail UI
- Project header section:
  - Project number
  - Title
  - Status badge and priority badge (side by side)
- Description section (if available)
- Client information card (read-only)
- Services included (badge list, if available)
- Team members section (avatar/initials + names, if available)
- Timeline card:
  - Start date
  - End date
  - Completion date (if completed)
- Progress bar with percentage display
- Milestones preview:
  - Shows first 3-5 milestones (if available)
  - Each milestone shows: title, due date, status
- Attachments preview:
  - Shows count of attachments
  - Link/button to navigate to attach assets page
- Notes section (if available)
- Action button: "Attach Assets" navigates to `/(authenticated)/projects/[id]/attach-assets`

### Attach Assets UI
- Page title: "Attach Assets"
- Existing attachments list:
  - Each attachment shows:
    - File name
    - File size (formatted)
    - Upload date
    - Download button/link
    - Delete button (if user has permission)
  - Empty state when no attachments
- File upload section:
  - "Select File" button opens document picker
  - Selected file name displayed (if file selected)
  - "Upload" button triggers `useUploadAttachment()` mutation
  - Progress indicator during upload
  - Success/error feedback using `Alert` component
- Navigation:
  - "Back" button navigates to project detail page
  - After successful upload, optionally navigate back or show success message

### Navigation Flow
- Sidebar "Projects" → `/(authenticated)/projects/index.tsx`
- Project card press → `/(authenticated)/projects/[id].tsx`
- "Attach Assets" button → `/(authenticated)/projects/[id]/attach-assets.tsx`
- "Back" from attach assets → `/(authenticated)/projects/[id].tsx`

### Error & Loading States
- List:
  - Loading: Skeleton cards (3-5 cards) with gray background
  - Error: Full-width `Alert` component with error message from `error.response?.data?.message`
  - Empty: Centered "No projects found" message
- Detail:
  - Loading: `Loading` component (fullScreen)
  - Error: `Alert` component with error message
- Attach Assets:
  - Loading: `ActivityIndicator` during upload/delete operations
  - Error: `Alert` component with error message
  - Success: `Alert` component with success message

### Mutation & Cache Behaviour
- `useUploadAttachment()` invalidates:
  - `['project', projectId]`
- `useDeleteAttachment()` invalidates:
  - `['project', projectId]`
- Success flows show success `Alert`, then optionally navigate back
- Errors display backend messages from `error.response?.data?.message`

### Key Differences from Admin
- **List View**: Card-based list instead of table
- **No Filters/Search**: Simplified UI for clients
- **No Create/Edit**: Clients can only view and attach assets
- **No Status Updates**: Clients cannot change project status
- **No Progress Updates**: Clients cannot update project progress
- **Simplified Detail View**: Focus on viewing information and attaching assets
- **No Milestones Management**: Clients can only view milestones, not add/edit/delete

### Future Enhancements
- Search functionality for projects list
- Filter by status or priority
- Sort projects by date, status, or priority
- Download all attachments as ZIP
- Preview attachments (images, PDFs)
- Project comments/notes from client
- Project timeline visualization
- Notifications for project updates

