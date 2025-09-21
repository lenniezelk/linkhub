import { z } from 'zod';

export type FetchState = 'IDLE' | 'FETCHING' | 'SUCCESS' | 'ERROR';

export type ResultStatus = 'SUCCESS' | 'ERROR';

export type Result =
    | { status: 'SUCCESS'; data?: any }
    | { status: 'ERROR'; error: string };

// User interface - consolidated from auth.ts and authContext.tsx
export interface User {
    id: string;
    email: string;
    name: string;
    handle: string | null;
}

export interface JWTPayload {
    sub: string; // user id
    email: string;
    name: string;
    handle: string | null;
    iat: number; // issued at
    exp: number; // expires at
}

export const SignupFormData = z.object({
    handle: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/),
    name: z.string().min(3).max(100),
});

export const GoogleSignupData = z.object({
    email: z.string().email(),
    name: z.string().min(1).max(100),
    emailVerified: z.boolean().optional(),
});

export type SignupData = z.infer<typeof SignupFormData>;
export type GoogleSignupData = z.infer<typeof GoogleSignupData>;

export interface GoogleLoginResponse {
    credential: string;
}

// Auth types
export interface LoginFormData {
    email: string;
    password: string;
}

export const LoginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

export type LoginData = z.infer<typeof LoginSchema>;

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

export interface RouterContext {
    auth: AuthState;
}

export interface AppSession {
    user: User | null;
    token: string | null;
}
