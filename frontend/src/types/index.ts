export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  username: string;
  email: string;
  phoneNumber: string | null;
  isActive: boolean;
  isSystemAdmin: boolean;
  isGlobalUserAdmin: boolean;
  isGlobal3rdLevelUser: boolean;
  organizations: Organization[];
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  parentId: string | null;
  parent: Organization | null;
  children: Organization[];
  users?: User[];
  createdAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  organization: Organization | null;
  createdAt: string;
}

export interface AuthSettings {
  id: number;
  passkeysEnabled: boolean;
  passwordEnabled: boolean;
  emailPasscodesEnabled: boolean;
  mobileNumberEnabled: boolean;
  totpEnabled: boolean;
  mfaEmailEnabled: boolean;
  mfaSmsEnabled: boolean;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
