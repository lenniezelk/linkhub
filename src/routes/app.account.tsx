import updateUser from '@/api/profile/updateUser';
import uploadProfileImage from '@/api/profile/uploadProfileImage';
import Button from '@/components/Button';
import Container from '@/components/Container';
import Footer from '@/components/Footer';
import InPageNotifications, { useInPageNotifications } from '@/components/InPageNotifications';
import Input from '@/components/Input';
import Menu from '@/components/Menu';
import ProfileImageEdit from '@/components/ProfileImageEdit';
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
    }
  };
});

const ProfileData = z.object({
  email: z.string().email(),
  name: z.string().refine((val) => val === '' || (val.length >= 3 && val.length <= 100), {
    message: "Name must be 3-100 characters long"
  }),
  handle: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/), // Optional password field
});

type ProfileData = z.infer<typeof ProfileData>;

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
  currentEmail: string;
  confirmNewEmail: string;
  newEmail: string;
  emailError: string;
  isSubmittingEmail: boolean;
  canChangeEmail: boolean;
  canChangePassword: boolean;
  passwordError: string;
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
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
  currentEmail: '',
  confirmNewEmail: '',
  newEmail: '',
  emailError: '',
  isSubmittingEmail: false,
  canChangeEmail: false,
  canChangePassword: false,
  passwordError: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
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
  const result = ProfileData.shape[field].safeParse(value);
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

    dispatch({ type: 'SET_VALUE', payload: { [`isSubmitting${field.charAt(0).toUpperCase() + field.slice(1)}`]: true, [`${field}Error`]: '' } });

    updateUser({ data: { [field]: value } }).then((result) => {
      if (result.status === 'SUCCESS') {
        inPageNotifications.addNotification({ type: 'success', message: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!` });
      } else {
        inPageNotifications.addNotification({ type: 'error', message: `Failed to update ${field}.`, keepForever: true });
      }
    }).catch(_ => {
      inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
    }).finally(() => {
      dispatch({ type: 'SET_VALUE', payload: { [`isSubmitting${field.charAt(0).toUpperCase() + field.slice(1)}`]: false } });
    });
  }, [inPageNotifications]);

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
      </main>
      <Footer />
    </Container>
  )
}
