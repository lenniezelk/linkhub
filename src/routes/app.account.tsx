import updateUser from '@/api/profile/updateUser';
import uploadProfileImage from '@/api/profile/uploadProfileImage';
import verifyEmail from '@/api/profile/verifyEmail';
import Button from '@/components/Button';
import Container from '@/components/Container';
import EmailVerification from '@/components/EmailVerification';
import Footer from '@/components/Footer';
import InPageNotifications, { useInPageNotifications } from '@/components/InPageNotifications';
import Input from '@/components/Input';
import Menu from '@/components/Menu';
import ProfileImageEdit from '@/components/ProfileImageEdit';
import SectionHeading from '@/components/SectionHeading';
import { dbClient } from '@/lib/db/dbClient';
import { profileImagesTable, usersTable } from '@/lib/db/schema';
import { useAppSession } from '@/lib/useAppSession';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';
import { desc, eq } from 'drizzle-orm';
import React, { useCallback } from 'react';
import { z } from 'zod';


export const Route = createFileRoute('/app/account')({
  component: RouteComponent,
  loader: () => fetchInitialData()
})

const fetchInitialData = createServerFn({ method: 'GET' }).handler(async () => {
  const db = dbClient();

  const session = await useAppSession();

  if (!session.data?.user) {
    throw redirect({ to: '/auth/login' });
  }

  const sessionUser = session.data.user;

  const dbUser = await db.select().from(usersTable).where(eq(usersTable.id, sessionUser.id)).limit(1);

  if (dbUser.length === 0) {
    throw notFound();
  }

  const profileImage = await db.select().from(profileImagesTable).where(eq(profileImagesTable.userId, sessionUser.id)).orderBy(desc(profileImagesTable.createdAt)).limit(1);

  return {
    status: 'SUCCESS',
    data: {
      email: sessionUser.email,
      name: sessionUser.name,
      handle: sessionUser.handle || '',
      profilePicture: profileImage.length > 0 ? profileImage[0].imageUrl : null,
      canChangeEmail: dbUser[0].passwordHash !== null, // Only allow email change if user has a password set (i.e., not OAuth-only user)
      canChangePassword: dbUser[0].passwordHash !== null, // Only allow password change if user has a password set
      emailVerified: sessionUser.emailVerified || false,
    }
  };
});

const ProfileDataShape = z.object({
  email: z.string().email(),
  confirmEmail: z.string().email(),
  name: z.string().refine((val) => (val.length >= 3 && val.length <= 100), {
    message: "Name must be 3-100 characters long"
  }),
  handle: z.string().refine((val) => (val.length >= 3 && val.length <= 20 && /^[a-zA-Z0-9_]+$/.test(val)), {
    message: "Handle must be 3-20 characters and contain only letters, numbers, and underscores"
  }),
  password: z.string().refine((val) => val.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&+\-_=.,;:'"\[\]{}()]*$/.test(val), {
    message: "Password must be more than 8 characters long and contain at least one letter and one number, and may include special characters"
  }),
  confirmPassword: z.string().refine((val) => val.length >= 8 && /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&+\-_=.,;:'"\[\]{}()]*$/.test(val), {
    message: "Password must be more than 8 characters long and contain at least one letter and one number, and may include special characters"
  })
});

type ProfileData = z.infer<typeof ProfileDataShape>;

interface State {
  name: string;
  nameError: string;
  isSubmittingName: boolean;
  handle: string;
  isSubmittingHandle: boolean;
  handleError: string;
  emailVerified: boolean;
  verifyEmailCodeSent: boolean;
  isSendingVerifyEmailCode: boolean;
  email: string;
  confirmEmail: string;
  emailError: string;
  confirmEmailError: string;
  isSubmittingEmail: boolean;
  canChangeEmail: boolean;
  canChangePassword: boolean;
  passwordError: string;
  password: string;
  confirmPassword: string;
  confirmPasswordError: string;
  isSubmittingPassword: boolean;
  profilePicUrl: string | null;
  isSubmittingProfileImage: boolean;
}

const initialState: State = {
  name: '',
  nameError: '',
  isSubmittingName: false,
  handle: '',
  isSubmittingHandle: false,
  handleError: '',
  emailVerified: false,
  verifyEmailCodeSent: false,
  isSendingVerifyEmailCode: false,
  confirmEmail: '',
  email: '',
  emailError: '',
  confirmEmailError: '',
  isSubmittingEmail: false,
  canChangeEmail: false,
  canChangePassword: false,
  passwordError: '',
  password: '',
  confirmPassword: '',
  confirmPasswordError: '',
  isSubmittingPassword: false,
  profilePicUrl: null,
  isSubmittingProfileImage: false,
}

type ReducerAction =
  | { type: 'SET_VALUE', payload: Partial<State> }

const reducer = (state: State, action: ReducerAction): State => {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        ...action.payload
      };
    default:
      return state;
  }
};

function validateField(field: keyof ProfileData, value: string): string {
  const result = ProfileDataShape.shape[field].safeParse(value);
  return result.success ? '' : result.error.errors[0].message;
}

function RouteComponent() {
  const routeContext = Route.useRouteContext();
  const initialData = Route.useLoaderData();
  const inPageNotifications = useInPageNotifications();
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    ...initialData.data,
    profilePicUrl: initialData.data.profilePicture
  });

  const submitProfileImage = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();


    const formData = new FormData(e.currentTarget);
    const file = formData.get('fileUpload') as File | null;

    if (!(file instanceof File) || file.size === 0) {
      inPageNotifications.addNotification({ type: 'error', message: 'No file selected.' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      inPageNotifications.addNotification({ type: 'error', message: 'File size exceeds 5MB limit.' });
      return;
    }

    dispatch({ type: 'SET_VALUE', payload: { isSubmittingProfileImage: true } });

    uploadProfileImage({ data: formData }).then((result) => {
      if (result.status === 'SUCCESS') {
        if (result.data?.thumbnail) {
          dispatch({ type: 'SET_VALUE', payload: { profilePicUrl: result.data.thumbnail } });
          inPageNotifications.addNotification({ type: 'success', message: 'Profile image uploaded successfully!' });
        } else if (result.data?.original) {
          dispatch({ type: 'SET_VALUE', payload: { profilePicUrl: result.data.original } });
          inPageNotifications.addNotification({ type: 'success', message: 'Profile image uploaded successfully!' });
        }
      } else {
        inPageNotifications.addNotification({ type: 'error', message: result.message, keepForever: true });
      }
    }).catch(error => {
      inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
      console.error('Error uploading profile image:', error);
    }).finally(() => {
      dispatch({ type: 'SET_VALUE', payload: { isSubmittingProfileImage: false } });
    });
  }, [inPageNotifications]);

  const updateUserField = useCallback(async (field: keyof ProfileData, value: string) => {
    const error = validateField(field, value);
    if (error) {
      dispatch({ type: 'SET_VALUE', payload: { [`${field}Error`]: error } });
      return;
    }

    if (field === 'email') {
      const confirmEmailError = validateField('confirmEmail', state.confirmEmail);
      if (confirmEmailError) {
        dispatch({ type: 'SET_VALUE', payload: { confirmEmailError } });
        return;
      }
    }

    if (field === 'password') {
      const confirmPasswordError = validateField('confirmPassword', state.confirmPassword);
      if (confirmPasswordError) {
        dispatch({ type: 'SET_VALUE', payload: { confirmPasswordError } });
        return;
      }
    }

    dispatch({ type: 'SET_VALUE', payload: { [`isSubmitting${field.charAt(0).toUpperCase() + field.slice(1)}`]: true, [`${field}Error`]: '' } });

    updateUser({ data: { [field]: value } }).then((result) => {
      if (result.status === 'SUCCESS') {
        if (field === 'email') {
          dispatch({ type: 'SET_VALUE', payload: { emailVerified: false } });
        }

        inPageNotifications.addNotification({ type: 'success', message: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!` });
      } else {
        inPageNotifications.addNotification({ type: 'error', message: result.error, keepForever: true });
      }
    }).catch(_ => {
      inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
    }).finally(() => {
      dispatch({ type: 'SET_VALUE', payload: { [`isSubmitting${field.charAt(0).toUpperCase() + field.slice(1)}`]: false } });
    });
  }, [inPageNotifications]);

  const validateConfirmEmail = useCallback((value: string): string => {
    const result = ProfileDataShape.shape.confirmEmail.safeParse(value.trim());
    return result.success ? state.email === value.trim() ? '' : 'Emails do not match' : 'Invalid email format';
  }, [state.email]);

  const doEmailVerification = useCallback(async () => {
    dispatch({ type: 'SET_VALUE', payload: { isSendingVerifyEmailCode: true } });

    verifyEmail().then((result) => {
      if (result.status === 'SUCCESS') {
        dispatch({ type: 'SET_VALUE', payload: { verifyEmailCodeSent: true, emailVerified: true } });
        inPageNotifications.addNotification({ type: 'success', message: 'Verification email sent! Please check your inbox.' });
      } else {
        inPageNotifications.addNotification({ type: 'error', message: result.message, keepForever: true });
      }
    }).catch(_ => {
      inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
    }).finally(() => {
      dispatch({ type: 'SET_VALUE', payload: { isSendingVerifyEmailCode: false } });
    });
  }, [inPageNotifications]);

  const validateConfirmPassword = useCallback((value: string): string => {
    const result = ProfileDataShape.shape.confirmPassword.safeParse(value.trim());
    return result.success ? state.password === value.trim() ? '' : 'Passwords do not match' : 'Password must be at least 8 characters, including letters and numbers';
  }, [state.password]);

  return (
    <Container>
      <Menu context={{ user: routeContext.user, userProfile: routeContext.userProfile }} />
      <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
        <h1 className="text-3xl font-bold">Update Your Account Details</h1>
        <InPageNotifications />
        <div className='flex flex-col items-center px-4 mt-8'>
          <ProfileImageEdit
            imageUrl={state.profilePicUrl ? state.profilePicUrl : undefined}
            submitProfileImage={submitProfileImage}
            isSubmittingProfileImage={state.isSubmittingProfileImage}
          />
        </div>
        <SectionHeading title="Update Your Name" />
        <form noValidate className="mt-8 flex flex-col items-start gap-8 px-4 max-w-md w-full" onSubmit={(e) => { e.preventDefault(); updateUserField('name', state.name); }}>
          <div className='flex items-center w-full'>
            <Input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={state.name}
              error={state.nameError}
              onChange={(e) => dispatch({ type: 'SET_VALUE', payload: { name: e.target.value, nameError: validateField('name', e.target.value) } })}
            />
          </div>
          <div className="w-full flex justify-center">
            <Button type="submit" disabled={state.isSubmittingName}>{state.isSubmittingName ? 'Submitting...' : 'Submit Name'}</Button>
          </div>
        </form>
        <SectionHeading title="Update Your Handle/Username" />
        <form noValidate className="mt-8 flex flex-col items-start gap-8 px-4 max-w-md w-full" onSubmit={(e) => { e.preventDefault(); updateUserField('handle', state.handle); }}>
          <div className='flex items-center w-full'>
            <Input
              type="text"
              name="handle"
              placeholder="Enter your handle/username"
              value={state.handle}
              error={state.handleError}
              onChange={(e) => dispatch({ type: 'SET_VALUE', payload: { handle: e.target.value, handleError: validateField('handle', e.target.value) } })}
            />
          </div>
          <div className="w-full flex justify-center">
            <Button type="submit" disabled={state.isSubmittingHandle}>{state.isSubmittingHandle ? 'Submitting...' : 'Submit Handle'}</Button>
          </div>
        </form>
        <SectionHeading title="Update Your Email" />
        {state.canChangeEmail ? (<form noValidate className="mt-8 flex flex-col items-start gap-8 px-4 max-w-md w-full" onSubmit={(e) => { e.preventDefault(); updateUserField('email', state.email); }}>
          <div className='flex items-center w-full'>
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={state.email}
              error={state.emailError}
              onChange={(e) => dispatch({ type: 'SET_VALUE', payload: { email: e.target.value, emailError: validateField('email', e.target.value) } })}
            />
          </div>
          <div className='flex items-center w-full'>
            <Input
              type="email"
              name="confirmEmail"
              placeholder="Re-enter your email"
              value={state.confirmEmail}
              error={state.confirmEmailError}
              onChange={(e) => dispatch({ type: 'SET_VALUE', payload: { confirmEmail: e.target.value, confirmEmailError: validateConfirmEmail(e.target.value) } })}
            />
          </div>
          <div className="w-full flex justify-center">
            <Button type="submit" disabled={state.isSubmittingEmail}>{state.isSubmittingEmail ? 'Submitting...' : 'Submit Email'}</Button>
          </div>
        </form>) : (
          <p className="mt-4 text-gray-600">Your account was created using a different authentication method. Email change is not available for your account.</p>
        )}
        <SectionHeading title="Verify Your Email" />
        <div className='flex items-center w-full max-w-md'>
          <EmailVerification
            emailVerified={state.emailVerified}
            onVerifyEmail={doEmailVerification}
            sendingVerification={state.isSendingVerifyEmailCode}
          />
        </div>
        <SectionHeading title="Change Password" />
        {state.canChangePassword ? (<form noValidate className="mt-8 flex flex-col items-start gap-8 px-4 max-w-md w-full" onSubmit={(e) => { e.preventDefault(); updateUserField('password', state.password); }}>
          <div className='flex items-center w-full'>
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={state.password}
              error={state.passwordError}
              onChange={(e) => dispatch({ type: 'SET_VALUE', payload: { password: e.target.value, passwordError: validateField('password', e.target.value) } })}
            />
          </div>
          <div className='flex items-center w-full'>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={state.confirmPassword}
              error={state.confirmPasswordError}
              onChange={(e) => dispatch({ type: 'SET_VALUE', payload: { confirmPassword: e.target.value, confirmPasswordError: validateConfirmPassword(e.target.value) } })}
            />
          </div>
          <div className="w-full flex justify-center">
            <Button type="submit" disabled={state.isSubmittingPassword}>{state.isSubmittingPassword ? 'Submitting...' : 'Submit Password'}</Button>
          </div>
        </form>) : (
          <p className="mt-4 text-gray-600">Your account was created using a different authentication method. Password change is not available for your account.</p>
        )}
      </main>
      <Footer />
    </Container>
  )
}
