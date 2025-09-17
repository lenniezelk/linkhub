import { drizzle } from 'drizzle-orm/d1';
import { getBindings } from '../cf_bindings';
import { usersTable } from './schema';


const dbClient = () => {
    const cfBindings = getBindings();
    return drizzle(cfBindings.DB);
}

export const insertUser = async (userData: typeof usersTable.$inferInsert) => {
    const db = dbClient();

    await db.insert(usersTable).values(userData);
}
