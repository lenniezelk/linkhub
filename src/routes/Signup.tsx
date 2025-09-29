import { type CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import * as jose from 'jose';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { z } from 'zod';
import Button from '@/components/Button';
import Container from '@/components/Container';
import Footer from '@/components/Footer';
import InPageNotifications, { useInPageNotifications } from '@/components/InPageNotifications';
import Input from '@/components/Input';
import Menu from '@/components/Menu';
import { GoogleAuthData, InAppTheme, type SignupData, SignupFormData } from '@/lib/types';
import { isConfirmPasswordValid, isEmailValid, isHandleValid, isNameValid, isPasswordValid, validateEmail, validateHandle, validatePassword } from '@/lib/validation';
// import { signUp, signUpGoogle } from '@/server/auth';
import { useAppSession } from '@/lib/useAppSession';
import { hashPassword } from '@/lib/auth';
import { profileImagesTable, themesTable, userSettingsTable, usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { dbClient } from '@/lib/db/dbClient';
import { createServerFn } from '@tanstack/react-start';


const signupSearchSchema = z.object({
    handle: z.string().optional(),
});

export const Route = createFileRoute('/Signup')({
    head: () => ({
        meta: [
            {
                title: 'LinkHub | Signup',
            },
        ],
    }),
    component: RouteComponent,
    validateSearch: zodValidator(signupSearchSchema),
    beforeLoad: async ({ context }) => {
        if (context.user) {
            throw redirect({ to: '/app' });
        }
    },
})

type SignupForm = SignupData & {
    handleError?: string;
    emailError?: string;
    passwordError?: string;
    confirmPassword: string;
    confirmPasswordError?: string;
    nameError?: string;
}

type SignupFormReducerActions =
    | { type: 'SET_VALUES'; payload: Partial<SignupForm> }

const initialState: SignupForm = {
    name: '',
    handle: '',
    handleError: '',
    email: '',
    emailError: '',
    password: '',
    passwordError: '',
    confirmPassword: '',
    confirmPasswordError: '',
    nameError: '',
}



const reducer = (state: SignupForm, action: SignupFormReducerActions): SignupForm => {
    switch (action.type) {
        case 'SET_VALUES':
            return { ...state, ...action.payload }
        default:
            return state
    }
}



export const signUp = createServerFn({ method: 'POST' }).validator(SignupFormData).handler(async (ctx) => {
    const db = dbClient();
    const userData = ctx.data;

    // check if email already exists
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, userData.email)).limit(1);
    if (existingUser.length > 0) {
        return {
            status: 'ERROR',
            error: 'Email already in use.',
        }
    }

    // check if handle already exists
    const existingHandle = await db.select().from(usersTable).where(eq(usersTable.handle, userData.handle)).limit(1);
    if (existingHandle.length > 0) {
        return {
            status: 'ERROR',
            error: 'Handle already in use.',
        };
    }

    const users = await db.insert(usersTable).values({ ...userData, passwordHash: await hashPassword(userData.password) }).returning();

    // fetch user profile
    let selectedTheme: InAppTheme | undefined;
    let profileImageUrl: string | undefined;
    const userSettings = await db.select().from(userSettingsTable).where(eq(userSettingsTable.userId, users[0].id)).limit(1);
    if (userSettings.length > 0 && userSettings[0].themeId) {
        const theme = await db.select().from(themesTable).where(eq(themesTable.id, userSettings[0].themeId)).limit(1);
        if (theme.length > 0) {
            selectedTheme = theme[0];
        }
    }

    const profileImage = await db.select().from(profileImagesTable).where(eq(profileImagesTable.userId, users[0].id)).limit(1);
    if (profileImage.length > 0) {
        profileImageUrl = profileImage[0].imageUrl;
    }

    const session = await useAppSession();
    await session.update({
        user: {
            id: users[0].id,
            email: users[0].email,
            name: users[0].name,
            handle: users[0].handle,
            emailVerified: users[0].emailVerified,
        },
        userProfile: {
            theme: selectedTheme ? {
                id: selectedTheme.id,
                name: selectedTheme.name,
                gradientClass: selectedTheme.gradientClass,
            } : undefined,
            profilePicture: profileImageUrl,
        }
    });

    return {
        status: 'SUCCESS'
    };


})

export const signUpGoogle = createServerFn({ method: 'POST' }).validator(GoogleAuthData).handler(async (ctx) => {
    const db = dbClient();
    const userData = ctx.data;

    // check if email already exists
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, userData.email)).limit(1);
    if (existingUser.length > 0) {
        return {
            status: 'ERROR',
            error: 'Email already in use.',
        }
    }

    const users = await db.insert(usersTable).values({
        email: userData.email,
        name: userData.name,
        passwordHash: null, // No password for OAuth users
        emailVerified: userData.emailVerified || false,
    }).returning();

    // fetch user profile
    let selectedTheme: InAppTheme | undefined;
    let profileImageUrl: string | undefined;
    const userSettings = await db.select().from(userSettingsTable).where(eq(userSettingsTable.userId, users[0].id)).limit(1);
    if (userSettings.length > 0 && userSettings[0].themeId) {
        const theme = await db.select().from(themesTable).where(eq(themesTable.id, userSettings[0].themeId)).limit(1);
        if (theme.length > 0) {
            selectedTheme = theme[0];
        }
    }

    const profileImage = await db.select().from(profileImagesTable).where(eq(profileImagesTable.userId, users[0].id)).limit(1);
    if (profileImage.length > 0) {
        profileImageUrl = profileImage[0].imageUrl;
    }

    const session = await useAppSession();
    await session.update({
        user: {
            id: users[0].id,
            email: users[0].email,
            name: users[0].name,
            handle: users[0].handle,
            emailVerified: users[0].emailVerified,
        },
        userProfile: {
            theme: selectedTheme ? {
                id: selectedTheme.id,
                name: selectedTheme.name,
                gradientClass: selectedTheme.gradientClass,
            } : undefined,
            profilePicture: profileImageUrl,
        }
    });

    return { status: 'SUCCESS' };
})

function RouteComponent() {
    const [state, dispatch] = React.useReducer(reducer, initialState)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const { handle: initialHandle } = Route.useSearch()
    const navigate = useNavigate()
    const inPageNotifications = useInPageNotifications();
    const routeContext = Route.useRouteContext();

    useEffect(() => {
        if (initialHandle) {
            dispatch({ type: 'SET_VALUES', payload: { handle: initialHandle, handleError: isHandleValid(initialHandle) } })
        }
    }, [initialHandle])

    const submit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Final validation before submit
        const handleError = isHandleValid(state.handle)
        const emailError = isEmailValid(state.email)
        const passwordError = isPasswordValid(state.password)
        const confirmPasswordError = isConfirmPasswordValid(state.password, state.confirmPassword)
        const nameError = isNameValid(state.name)

        if (handleError || emailError || passwordError || confirmPasswordError || nameError) {
            dispatch({
                type: 'SET_VALUES',
                payload: { handleError, emailError, passwordError, confirmPasswordError, nameError }
            })
            return
        }

        setIsSubmitting(true)
        inPageNotifications.clearNotifications();

        signUp({
            data: {
                handle: state.handle.trim(),
                email: state.email.trim(),
                password: state.password.trim(),
                name: state.name.trim()
            }
        }).then((result) => {
            if (result.status === 'SUCCESS') {
                inPageNotifications.addNotification({ type: 'success', message: 'Account created successfully! You can now log in.', keepForever: true });
                navigate({ to: '/app', replace: true });
            } else {
                inPageNotifications.addNotification({ type: 'error', message: result.error || 'An error occurred during signup. Please try again.', keepForever: true });
            }
        }).catch((_error) => {
            inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
        }).finally(() => {
            setIsSubmitting(false);
        });
    }, [state, dispatch, inPageNotifications, navigate])

    const googleLogin = useCallback((response: CredentialResponse) => {
        const userInfo: { email: string; name: string; email_verified: boolean } = jose.decodeJwt(response.credential as string);

        signUpGoogle({ data: userInfo }).then((result) => {
            if (result.status === 'SUCCESS') {
                inPageNotifications.addNotification({ type: 'success', message: 'Account created successfully! Redirecting...', keepForever: true });
                navigate({ to: '/app/createHandle', replace: true });
            } else {
                inPageNotifications.addNotification({ type: 'error', message: result.error || 'An error occurred during signup. Please try again.', keepForever: true });
            }
        }).catch((_error) => {
            inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred during Google signup. Please try again later.', keepForever: true });
        });
    }, [inPageNotifications, navigate]);

    const googleLoginError = useCallback(() => {
        inPageNotifications.addNotification({ type: 'error', message: 'An error occurred during Google login. Please try again.', keepForever: true });
    }, [inPageNotifications]);

    return (
        <Container>
            <Menu user={routeContext.user} />
            <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
                <InPageNotifications />
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-4xl text-center">
                    Get Started with LinkHub for free.
                </h1>
                <form className="mt-6  flex flex-col items-center gap-8 px-4" noValidate onSubmit={submit}>
                    <div className="w-full max-w-md">
                        <Input
                            id="claim-handle"
                            type="text"
                            inputMode="text"
                            placeholder="username"
                            value={state.handle}
                            onChange={(e) => dispatch({ type: 'SET_VALUES', payload: { handle: e.target.value, handleError: isHandleValid(e.target.value) } })}
                            className="py-2.5 pl-[14ch] pr-4"
                            error={state.handleError}
                            inputPrefix={<span className="font-mono text-base font-semibold text-slate-800">linkhub.link/</span>}
                        />
                    </div>
                    <div className="relative w-full max-w-md mt-2">
                        <Input
                            id="name"
                            type="text"
                            inputMode="text"
                            placeholder="Your Name"
                            value={state.name}
                            onChange={(e) => dispatch({ type: 'SET_VALUES', payload: { name: e.target.value, nameError: isNameValid(e.target.value) } })}
                            error={state.nameError}
                        />
                    </div>
                    <div className="relative w-full max-w-md mt-2">
                        <Input
                            id="email"
                            type="email"
                            inputMode="email"
                            placeholder="yourname@example.com"
                            value={state.email}
                            onChange={(e) => dispatch({ type: 'SET_VALUES', payload: { email: e.target.value, emailError: isEmailValid(e.target.value) } })}
                            error={state.emailError}
                        />
                    </div>
                    <div className="relative w-full max-w-md mt-2">
                        <Input
                            id="password"
                            type="password"
                            inputMode="text"
                            placeholder="Create a password"
                            value={state.password}
                            onChange={(e) => dispatch({ type: 'SET_VALUES', payload: { password: e.target.value, passwordError: isPasswordValid(e.target.value) } })}
                            error={state.passwordError}
                        />
                    </div>
                    <div className="relative w-full max-w-md mt-2">
                        <Input
                            id="confirm-password"
                            type="password"
                            inputMode="text"
                            placeholder="Password again"
                            value={state.confirmPassword}
                            onChange={(e) => dispatch({ type: 'SET_VALUES', payload: { confirmPassword: e.target.value, confirmPasswordError: isConfirmPasswordValid(state.password, e.target.value) } })}
                            error={state.confirmPasswordError}
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Create Account'}</Button>
                </form>
                <div className="flex items-center w-full max-w-md mt-6 mb-2">
                    <hr className="flex-grow border-t border-gray-500" />
                    <span className="px-4 text-sm text-gray-500">or</span>
                    <hr className="flex-grow border-t border-gray-500" />
                </div>
                <div className='mt-4'>
                    <GoogleLogin onSuccess={googleLogin} onError={googleLoginError} shape='pill' auto_select />
                </div>
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <a
                            href="/Login"
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Sign in here
                        </a>
                    </p>
                </div>
            </main>
            <Footer />
        </Container>
    )
}
