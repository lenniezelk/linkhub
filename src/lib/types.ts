import { z } from 'zod';

export type FetchState = 'IDLE' | 'FETCHING' | 'SUCCESS' | 'ERROR';

export type ResultStatus = 'SUCCESS' | 'ERROR';

export type Result =
    | { status: 'SUCCESS'; data?: any }
    | { status: 'ERROR'; error: string };

export const SignupFormData = z.object({
    handle: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
    email: z.email(),
    password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/),
    name: z.string().min(3).max(100),
});

export type SignupData = z.infer<typeof SignupFormData>;
