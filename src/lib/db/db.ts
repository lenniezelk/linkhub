import { drizzle } from 'drizzle-orm/d1';
import { getBindings } from '../cf_bindings';
import { usersTable } from './schema';
import { hashPassword } from '../auth';
import { eq } from 'drizzle-orm';
import { Result, SignupData } from '../types';
import { Sign } from 'crypto';


const dbClient = () => {
    const cfBindings = getBindings();
    return drizzle(cfBindings.DB);
}

export const insertUser = async (userData: SignupData): Promise<Result> => {
    const db = dbClient();

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

    await db.insert(usersTable).values({ ...userData, passwordHash: await hashPassword(userData.password) });

    return { status: 'SUCCESS' };
}
