export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarText: string;
  isDemo: boolean;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}
