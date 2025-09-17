import { createFileRoute, useSearch } from '@tanstack/react-router'
import Container from '../components/Container'
import Menu from '../components/Menu'
import * as React from 'react';
import Input from '../components/Input';
import Button from '../components/Button';
import { validateEmail, validateHandle, validatePassword } from '../lib/validation';
import { wait } from '../lib/utils';
import { useCallback } from 'react';
import { z } from 'zod';
import { zodValidator } from '@tanstack/zod-adapter'
import { useEffect } from 'react';

const signupSearchSchema = z.object({
    handle: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).optional(),
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
    validateSearch: zodValidator(signupSearchSchema)
})

interface SignupForm {
    handle: string;
    handleError?: string;
    email: string;
    emailError?: string;
    password: string;
    passwordError?: string;
    confirmPassword: string;
    confirmPasswordError?: string;
}

type SignupFormReducerActions =
    | { type: 'SET_VALUES'; payload: Partial<SignupForm> }

const initialState: SignupForm = {
    handle: '',
    handleError: '',
    email: '',
    emailError: '',
    password: '',
    passwordError: '',
    confirmPassword: '',
    confirmPasswordError: '',
}

const reducer = (state: SignupForm, action: SignupFormReducerActions): SignupForm => {
    switch (action.type) {
        case 'SET_VALUES':
            return { ...state, ...action.payload }
        default:
            return state
    }
}

const isEmpty = (str: string) => !str || str.trim() === ''

const isEmailValid = (email: string) => {
    if (isEmpty(email)) return 'Email is required'
    if (!validateEmail(email)) return 'Email is invalid'
    return ''
}

const isPasswordValid = (password: string) => {
    if (isEmpty(password)) return 'Password is required'
    if (!validatePassword(password)) return 'Password must be at least 8 characters long and contain at least one letter and one number'
    return ''
}

const isConfirmPasswordValid = (password: string, confirmPassword: string) => {
    if (isEmpty(confirmPassword)) return 'Please confirm your password'
    if (password !== confirmPassword) return 'Passwords do not match'
    return ''
}

const isHandleValid = (handle: string) => {
    if (isEmpty(handle)) return 'Handle is required'
    if (!validateHandle(handle)) return 'Handle must be 3-20 characters long and can only contain letters, numbers, and underscores'
    return ''
}

function RouteComponent() {
    const [state, dispatch] = React.useReducer(reducer, initialState)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const { handle: initialHandle } = Route.useSearch()

    useEffect(() => {
        if (initialHandle) {
            dispatch({ type: 'SET_VALUES', payload: { handle: initialHandle, handleError: isHandleValid(initialHandle) } })
        }
    }, [initialHandle])

    const submit = useCallback(() => {
        // Final validation before submit
        const handleError = isHandleValid(state.handle)
        const emailError = isEmailValid(state.email)
        const passwordError = isPasswordValid(state.password)
        const confirmPasswordError = isConfirmPasswordValid(state.password, state.confirmPassword)

        if (handleError || emailError || passwordError || confirmPasswordError) {
            dispatch({
                type: 'SET_VALUES',
                payload: { handleError, emailError, passwordError, confirmPasswordError }
            })
            return
        }

        setIsSubmitting(true)

        wait(1000).then(() => {
            setIsSubmitting(false)
            alert('Account created successfully!')
        })
    }, [state, dispatch])


    return (
        <Container>
            <Menu />
            <main className="mt-12 min-h-[calc(100vh-6rem)]">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-4xl text-center">
                    Get Started with LinkHub for free
                </h1>
                <form className="mt-6  flex flex-col items-center gap-8 px-4" noValidate onSubmit={(e) => e.preventDefault()}>
                    <div className="relative w-full max-w-md">
                        <Input
                            id="claim-handle"
                            type="text"
                            inputMode="text"
                            placeholder="your LinkHub handle"
                            value={state.handle}
                            onChange={(e) => dispatch({ type: 'SET_VALUES', payload: { handle: e.target.value, handleError: isHandleValid(e.target.value) } })}
                            className="py-2.5 pl-[14ch] pr-4"
                            error={state.handleError}
                        />
                        <span
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none font-mono text-base font-semibold text-slate-800 z-10"
                            aria-hidden="true"
                        >
                            linkhub.link/
                        </span>
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
                    <Button type="submit" disabled={isSubmitting} onClick={submit}>Create Account</Button>
                </form>
            </main>
        </Container>
    )
}
