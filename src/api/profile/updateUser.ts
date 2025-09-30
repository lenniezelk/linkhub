import { useAppSession } from '@/lib/useAppSession';
import { createServerFn } from '@tanstack/react-start';
import { notFound, redirect } from '@tanstack/react-router'
import { dbClient } from '@/lib/db/dbClient';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { User, UpdateUserData } from '@/lib/types';
import { hashPassword } from '@/lib/auth';

export const updateUser = createServerFn({ method: 'POST' })
    .validator(UpdateUserData).handler(async (ctx) => {
        const appSession = await useAppSession();
        if (!appSession.data?.user) {
            throw redirect({ to: '/auth/login', replace: true });
        }

        const db = dbClient();
        const user = await db.select().from(usersTable).where(eq(usersTable.id, appSession.data.user.id)).limit(1);
        if (user.length === 0) {
            throw notFound();
        }

        const updateData: Partial<User> = {
            ...ctx.data,
            ...(ctx.data.password ? { passwordHash: await hashPassword(ctx.data.password) } : {}), // Hash password if provided
        };

        // Update user data
        await db.update(usersTable).set(updateData).where(eq(usersTable.id, user[0].id));

        await appSession.update({
            user: { 
                name: updateData.name || appSession.data.user.name,
                email: updateData.email || appSession.data.user.email,
                handle: updateData.handle || appSession.data.user.handle,
                emailVerified: appSession.data.user.emailVerified,
                id: appSession.data.user.id
             },
        });

        return { status: 'SUCCESS' };
    });

export default updateUser;

