#!/usr/bin/env tsx

// Simple script to test database connectivity in development
import { getPlatformProxy } from "wrangler";
import { drizzle } from 'drizzle-orm/d1';
import { usersTable } from '../src/lib/db/schema';

async function testDatabase() {
    try {
        console.log('🔗 Connecting to local D1 database...');

        const proxy = await getPlatformProxy();
        const env = proxy.env as any;
        const db = drizzle(env.DB);

        console.log('✅ Connected successfully!');

        // Test a simple query
        console.log('📊 Testing query...');
        const users = await db.select().from(usersTable).limit(5);
        console.log(`Found ${users.length} users in the database`);

        if (users.length > 0) {
            console.log('Sample user:', users[0]);
        } else {
            console.log('No users found - database is empty');
        }

    } catch (error) {
        console.error('❌ Database test failed:', error);
    }
}

testDatabase().then(() => process.exit(0));