// Redux State Types

export interface Role {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
  isSystemRole?: boolean;
}

export interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: Role[];
  avatar?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  isActive: boolean;
  emailVerified?: boolean;
  notificationPreferences?: {
    email?: boolean;
    sms?: boolean;
    inApp?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
}

