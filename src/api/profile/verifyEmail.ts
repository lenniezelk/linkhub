import { useAppSession } from '@/lib/useAppSession';
import { createServerFn } from '@tanstack/react-start';
import { notFound, redirect } from '@tanstack/react-router'
import { dbClient } from '@/lib/db/dbClient';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const verifyEmail = createServerFn({ method: 'POST' }).handler(async () => {
  const db = dbClient();

  const session = await useAppSession();

  if (!session.data?.user) {
    throw redirect({ to: '/auth/login' });
  }

  const user = await db.select().from(usersTable).where(eq(usersTable.id, session.data.user.id)).limit(1);

  if (user.length === 0) {
    throw notFound();
  }

  if (user[0].emailVerified) {
    return {
      status: 'SUCCESS',
      message: 'Email is already verified.',
    };
  }

  // In a real application, you would send a verification email here.
  // For this example, we'll just simulate that the email has been verified.

  await db.update(usersTable).set({ emailVerified: true }).where(eq(usersTable.id, user[0].id));

  await session.update({
    user: { ...session.data.user, emailVerified: true },
  });

  return {
    status: 'SUCCESS',
    message: 'Email verified successfully.',
  };
});

export default verifyEmail;
