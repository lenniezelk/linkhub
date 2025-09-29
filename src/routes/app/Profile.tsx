import uploadProfileImage from '@/api/profile/uploadProfileImage';
import Container from '@/components/Container';
import Footer from '@/components/Footer';
import InPageNotifications, { useInPageNotifications } from '@/components/InPageNotifications';
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


export const Route = createFileRoute('/app/Profile')({
  component: RouteComponent,
  loader: () => fetchInitialData()
})

const fetchInitialData = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const db = dbClient();

  const session = await useAppSession();

  if (!session.data?.user) {
    throw redirect({ to: '/Login' });
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
      handle: sessionUser.handle,
      profilePicture: profileImage.length > 0 ? profileImage[0].imageUrl : null,
      canChangeEmail: dbUser[0].passwordHash !== null, // Only allow email change if user has a password set (i.e., not OAuth-only user)
      canChangePassword: dbUser[0].passwordHash !== null, // Only allow password change if user has a password set
    }
  };
});

const ProfileData = z.object({
  email: z.string().email(),
  name: z.string().min(3).max(100),
  handle: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/).nullable(),
  profilePicture: z.string().url().nullable(),
});

type ProfileData = z.infer<typeof ProfileData>;

interface State {
  currentName: string;
  newName: string;
  nameError: string;
  isSubmittingName: boolean;
  currentHandle: string;
  newHandle: string;
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
  currentName: '',
  newName: '',
  nameError: '',
  isSubmittingName: false,
  currentHandle: '',
  newHandle: '',
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
  | { type: 'SET_VALUE', field: keyof State, value: string | boolean }

const reducer = (state: State, action: ReducerAction): State => {
  switch (action.type) {
    case 'SET_VALUE':
      return {
        ...state,
        [action.field]: action.value,
      };
    default:
      return state;
  }
};

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

    dispatch({ type: 'SET_VALUE', field: 'isSubmittingProfileImage', value: true });

    uploadProfileImage({ data: formData }).then((result) => {
      if (result.status === 'SUCCESS') {
        if (result.data?.thumbnail) {
          dispatch({ type: 'SET_VALUE', field: 'profilePicUrl', value: result.data.thumbnail });
          inPageNotifications.addNotification({ type: 'success', message: 'Profile image uploaded successfully!' });
        } else if (result.data?.original) {
          dispatch({ type: 'SET_VALUE', field: 'profilePicUrl', value: result.data.original });
          inPageNotifications.addNotification({ type: 'success', message: 'Profile image uploaded successfully!' });
        }
      } else {
        inPageNotifications.addNotification({ type: 'error', message: result.message, keepForever: true });
      }
    }).catch(error => {
      inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
      console.error('Error uploading profile image:', error);
    }).finally(() => {
      dispatch({ type: 'SET_VALUE', field: 'isSubmittingProfileImage', value: false });
    });
  }, [inPageNotifications]);

  return (
    <Container>
      <Menu context={{ user: routeContext.user, userProfile: routeContext.userProfile }} />
      <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
        <InPageNotifications />
        <div className='flex flex-col items-center px-4 mt-8'>
          <ProfileImageEdit
            imageUrl={state.profilePicUrl ? state.profilePicUrl : undefined}
            submitProfileImage={submitProfileImage}
            isSubmittingProfileImage={state.isSubmittingProfileImage}
          />
        </div>
      </main>
      <Footer />
    </Container>
  )
}
