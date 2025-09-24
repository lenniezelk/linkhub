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

export const SignupFormData = z.object({
    handle: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
    email: z.string().email(),
    password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/),
    name: z.string().min(3).max(100),
});

export const LoginFormData = z.object({
    handleOrEmail: z.string().min(3).max(100).regex(/^[a-zA-Z0-9_@.]+$/),
    password: z.string().min(1),
});

export const GoogleAuthData = z.object({
    email: z.string().email(),
    name: z.string(),
    emailVerified: z.boolean().optional(),
});

export type SignupData = z.infer<typeof SignupFormData>;
export type GoogleAuthData = z.infer<typeof GoogleAuthData>;

export type LoginData = z.infer<typeof LoginFormData>;

export interface GoogleLoginResponse {
    credential: string;
}

// Auth types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface AppSession {
    user: User | null;
    token: string | null;
}

export const HandleFormData = z.object({
    handle: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
});

export type HandleData = z.infer<typeof HandleFormData>;

export type SocialLinkType = 'instagram' | 'twitter' | 'linkedin' | 'facebook' | 'tiktok' | 'youtube' | 'website' | 'github'  | 'pinterest';

export type SocialLinkServerData = {
    type: SocialLinkType;
    url: string;
};

export interface InAppTheme {
    id: string;
    name: string;
    gradientClass: string;
}
