export interface User {
  id: string;
  email: string;
  password_hash: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Session {
  id: string;
  user_id: string;
  refresh_token: string;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
}

// From TechArch JWT config section:
export interface LoginRequest { email: string; password: string; }
export interface LoginResponse { access_token: string; refresh_token: string; expires_in: number; }
export interface RefreshRequest { refresh_token: string; }
export interface RefreshResponse { access_token: string; expires_in: number; }
export interface RegisterRequest { email: string; password: string; }
export interface RegisterResponse {
  user: { id: string; email: string };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// JWT payload — from TechArch:
export interface JwtPayload {
  sub: string;      // user UUID
  email: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: { id: string; email: string };
}
