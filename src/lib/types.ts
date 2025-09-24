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

export const linksData = z.object({
    instagram: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 30 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "Instagram handle must be 1-30 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    instagramError: z.string().optional(),
    twitter: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 15 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "X handle must be 1-15 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    twitterError: z.string().optional(),
    github: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 39 && /^[a-zA-Z0-9._-]+$/.test(val)), {
        message: "GitHub username must be 1-39 characters and contain only letters, numbers, dots, hyphens, and underscores"
    }).optional(),
    githubError: z.string().optional(),
    linkedin: z.string().refine((val) => val === '' || (val.length >= 3 && val.length <= 100 && /^[a-zA-Z0-9-]+$/.test(val)), {
        message: "LinkedIn profile must be 3-100 characters and contain only letters, numbers, and hyphens"
    }).optional(),
    linkedinError: z.string().optional(),
    website: z.string().refine((val) => val === '' || z.string().url().safeParse(val).success, {
        message: "Please enter a valid URL"
    }).optional(),
    websiteError: z.string().optional(),
    tiktok: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 24 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "TikTok handle must be 1-24 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    tiktokError: z.string().optional(),
    youtube: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 100 && /^[a-zA-Z0-9._-]+$/.test(val)), {
        message: "YouTube channel must be 1-100 characters and contain only letters, numbers, dots, hyphens, and underscores"
    }).optional(),
    youtubeError: z.string().optional(),
    pinterest: z.string().refine((val) => val === '' || (val.length >= 3 && val.length <= 30 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "Pinterest handle must be 3-30 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    pinterestError: z.string().optional(),
    facebook: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 50 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "Facebook profile must be 1-50 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    facebookError: z.string().optional(),
});

export type LinksData = z.infer<typeof linksData>;

export type OtherDashboardData = {
    profilePicUrl?: string;
    isSubmitting: boolean;
    isSubmittingProfileImage: boolean;
    currentThemeId?: string;
    themes: InAppTheme[];
    rootUrl: string;
};

export type DashboardData = LinksData & OtherDashboardData;

// Type for error fields only
export type LinksErrors = {
    instagramError?: string;
    twitterError?: string;
    githubError?: string;
    linkedinError?: string;
    websiteError?: string;
    tiktokError?: string;
    youtubeError?: string;
    pinterestError?: string;
    facebookError?: string;
};

// Type for links data only (DashboardData without error fields)
// Type for links data only (LinksData without error fields)  
export type LinksOnly = Omit<LinksData, keyof LinksErrors>;
