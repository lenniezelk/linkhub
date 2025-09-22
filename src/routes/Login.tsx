import { type CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import * as jose from 'jose';
import * as React from 'react';
import { useCallback, } from 'react';
import Button from '@/components/Button';
import Container from '@/components/Container';
import Footer from '@/components/Footer';
import InPageNotifications, { useInPageNotifications } from '@/components/InPageNotifications';
import Input from '@/components/Input';
import Menu from '@/components/Menu';
import { GoogleAuthData, LoginData, LoginFormData, User } from '@/lib/types';
import { validateEmail, validateHandle } from '@/lib/validation';
import { useAppSession } from '@/lib/useAppSession';
import { verifyPassword } from '@/lib/auth';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { dbClient } from '@/lib/db/dbClient';
import { createServerFn } from '@tanstack/react-start';


export const Route = createFileRoute('/Login')({
    head: () => ({
        meta: [
            {
                title: 'LinkHub | Login',
            },
        ],
    }),
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        if (context.user) {
            throw redirect({ to: '/app' });
        }
    },
})

type LoginForm = LoginData & {
    handleOrEmailError?: string;
    passwordError?: string;
}

type SignupFormReducerActions =
    | { type: 'SET_VALUES'; payload: Partial<LoginForm> }

const initialState: LoginForm = {
    handleOrEmail: '',
    password: '',
    handleOrEmailError: '',
    passwordError: '',
}


const reducer = (state: LoginForm, action: SignupFormReducerActions): LoginForm => {
    switch (action.type) {
        case 'SET_VALUES':
            return { ...state, ...action.payload }
        default:
            return state
    }
}

const isEmpty = (str: string) => !str || str.trim() === ''

const isValidHandleOrEmail = (handleOrEmail: string) => {
    if (isEmpty(handleOrEmail)) return 'Handle or Email is required'
    if (!validateEmail(handleOrEmail) && !validateHandle(handleOrEmail)) return 'Handle or Email is invalid'
    return ''
}

export const login = createServerFn({ method: 'POST' }).validator(LoginFormData).handler(async (ctx) => {
    const db = dbClient();
    const userData = ctx.data;

    const isEmail = userData.handleOrEmail.includes('@');
    let user: User & { passwordHash: string | null } | null = null;

    if (isEmail) {
        // check if user by email
        const existingUserByEmail = await db.select().from(usersTable).where(eq(usersTable.email, userData.handleOrEmail)).limit(1);
        if (existingUserByEmail.length == 0) {
            return {
                status: 'ERROR',
                error: 'Invalid email/handle or password.',
            }
        }
        user = existingUserByEmail[0];
    } else {
        // check if user by handle
        const existingUserByHandle = await db.select().from(usersTable).where(eq(usersTable.handle, userData.handleOrEmail)).limit(1);
        if (existingUserByHandle.length == 0) {
            return {
                status: 'ERROR',
                error: 'Invalid email/handle or password.',
            }
        }
        user = existingUserByHandle[0];
    }

    if (!user || !user.passwordHash) {
        return {
            status: 'ERROR',
            error: 'Invalid email/handle or password.',
        }
    }

    const isPasswordCorrect = await verifyPassword(userData.password, user.passwordHash);
    if (!isPasswordCorrect) {
        return {
            status: 'ERROR',
            error: 'Invalid email/handle or password.',
        }
    }

    const session = await useAppSession();
    await session.update({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            handle: user.handle,
        },
    });

    return {
        status: 'SUCCESS'
    };
})

export const loginGoogle = createServerFn({ method: 'POST' }).validator(GoogleAuthData).handler(async (ctx) => {
    const db = dbClient();
    const userData = ctx.data;

    // check if does not exist
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, userData.email)).limit(1);
    if (existingUser.length == 0) {
        return {
            status: 'ERROR',
            error: 'No account found with this email. Please sign up first.',
        }
    }

    const session = await useAppSession();
    await session.update({
        user: {
            id: existingUser[0].id,
            email: existingUser[0].email,
            name: existingUser[0].name,
            handle: existingUser[0].handle,
        },
    });

    return { status: 'SUCCESS' };
})

function RouteComponent() {
    const [state, dispatch] = React.useReducer(reducer, initialState)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const navigate = useNavigate()
    const inPageNotifications = useInPageNotifications();

    const submit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Final validation before submit
        const handleOrEmailError = isValidHandleOrEmail(state.handleOrEmail)

        if (handleOrEmailError) {
            dispatch({
                type: 'SET_VALUES',
                payload: { handleOrEmailError }
            })
            return
        }

        setIsSubmitting(true)
        inPageNotifications.clearNotifications();

        login({
            data: {
                handleOrEmail: state.handleOrEmail.trim(),
                password: state.password.trim(),
            }
        }).then((result) => {
            if (result.status === 'SUCCESS') {
                inPageNotifications.addNotification({ type: 'success', message: 'Login successful! Redirecting...', keepForever: true });
                navigate({ to: '/app', replace: true });
            } else {
                inPageNotifications.addNotification({ type: 'error', message: result.error || 'An error occurred during login. Please try again.', keepForever: true });
            }
        }).catch((_error) => {
            inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
        }).finally(() => {
            setIsSubmitting(false);
        });
    }, [state, dispatch, inPageNotifications, navigate])

    const googleLogin = useCallback((response: CredentialResponse) => {
        const userInfo: { email: string; name: string; email_verified: boolean } = jose.decodeJwt(response.credential as string);

        loginGoogle({ data: userInfo }).then((result) => {
            if (result.status === 'SUCCESS') {
                inPageNotifications.addNotification({ type: 'success', message: 'Login successful! Redirecting...', keepForever: true });
                navigate({ to: '/app/createHandle', replace: true });
            } else {
                inPageNotifications.addNotification({ type: 'error', message: result.error || 'An error occurred during Google login. Please try again.', keepForever: true });
            }
        }).catch((_error) => {
            inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred during Google login. Please try again later.', keepForever: true });
        });
    }, [inPageNotifications, navigate]);

    const googleLoginError = useCallback(() => {
        inPageNotifications.addNotification({ type: 'error', message: 'An error occurred during Google login. Please try again.', keepForever: true });
    }, [inPageNotifications]);

    return (
        <Container>
            <Menu />
            <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
                <InPageNotifications />
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-4xl text-center">
                    Welcome back to LinkHub.
                </h1>
                <form className="mt-6  flex flex-col items-center gap-8 px-4  min-w-sm" noValidate onSubmit={submit}>
                    <div className="relative w-full max-w-md mt-2">
                        <Input
                            id="name"
                            type="text"
                            inputMode="text"
                            placeholder="Your username or email"
                            value={state.handleOrEmail}
                            onChange={(e) => dispatch({ type: 'SET_VALUES', payload: { handleOrEmail: e.target.value, handleOrEmailError: isValidHandleOrEmail(e.target.value) } })}
                            error={state.handleOrEmailError}
                        />
                    </div>
                    <div className="relative w-full max-w-md mt-2">
                        <Input
                            id="password"
                            type="password"
                            inputMode="text"
                            placeholder="Password"
                            value={state.password}
                            onChange={(e) => dispatch({ type: 'SET_VALUES', payload: { password: e.target.value } })}
                        />
                    </div>
                    <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Log In'}</Button>
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
                        Don't have an account?{' '}
                        <a
                            href="/Signup"
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Sign up here
                        </a>
                    </p>
                </div>
            </main>
            <Footer />
        </Container>
    )
}
