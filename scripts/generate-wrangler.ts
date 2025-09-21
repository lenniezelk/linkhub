#!/usr/bin/env tsx

import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Generate wrangler.jsonc with multi-environment support (staging/production)
 * 
 * The top-level configuration uses production values by default.
 * 
 * Required environment variables:
 * - DATABASE_ID: Default database ID (used for staging if staging-specific not provided)
 * - JWT_SECRET: Default JWT secret (used for staging if staging-specific not provided)
 * - SESSION_SECRET: Default session secret (used for staging if staging-specific not provided)
 * 
 * Optional environment variables for staging:
 * - STAGING_DATABASE_ID: Staging database ID (defaults to DATABASE_ID)
 * - STAGING_DATABASE_NAME: Staging database name (defaults to 'linkhub-staging')
 * - STAGING_WORKER_NAME: Staging worker name (defaults to 'linkhub-staging')
 * - STAGING_JWT_SECRET: Staging JWT secret (defaults to JWT_SECRET)
 * - STAGING_SESSION_SECRET: Staging session secret (defaults to SESSION_SECRET)
 * 
 * Optional environment variables for production (used for top-level config):
 * - PRODUCTION_DATABASE_ID: Production database ID (defaults to DATABASE_ID)
 * - PRODUCTION_DATABASE_NAME: Production database name (defaults to 'linkhub-production')
 * - PRODUCTION_WORKER_NAME: Production worker name (defaults to 'linkhub-production')
 * - PRODUCTION_JWT_SECRET: Production JWT secret (defaults to JWT_SECRET)
 * - PRODUCTION_SESSION_SECRET: Production session secret (defaults to SESSION_SECRET)
 */

// Get environment variables
const DATABASE_ID = process.env.DATABASE_ID || process.env.CLOUDFLARE_DATABASE_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

// Staging environment variables
const STAGING_DATABASE_ID = process.env.STAGING_DATABASE_ID;
const STAGING_DATABASE_NAME = process.env.STAGING_DATABASE_NAME || 'linkhub-staging';
const STAGING_WORKER_NAME = process.env.STAGING_WORKER_NAME || 'linkhub-staging';
const STAGING_JWT_SECRET = process.env.STAGING_JWT_SECRET;
const STAGING_SESSION_SECRET = process.env.STAGING_SESSION_SECRET;

// Production environment variables
const PRODUCTION_DATABASE_ID = process.env.PRODUCTION_DATABASE_ID || DATABASE_ID;
const PRODUCTION_DATABASE_NAME = process.env.PRODUCTION_DATABASE_NAME || 'linkhub-production';
const PRODUCTION_WORKER_NAME = process.env.PRODUCTION_WORKER_NAME || 'linkhub-production';
const PRODUCTION_JWT_SECRET = process.env.PRODUCTION_JWT_SECRET;
const PRODUCTION_SESSION_SECRET = process.env.PRODUCTION_SESSION_SECRET;

if (!DATABASE_ID) {
    console.error('❌ DATABASE_ID environment variable is required');
    console.error('Set it with: export DATABASE_ID=your-database-id');
    process.exit(1);
}

if (!JWT_SECRET) {
    console.error('❌ JWT_SECRET environment variable is required');
    console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    process.exit(1);
}

if (!SESSION_SECRET) {
    console.error('❌ SESSION_SECRET environment variable is required');
    console.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    process.exit(1);
}

const wranglerConfig = {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": PRODUCTION_WORKER_NAME,
    "main": ".output/server/index.mjs",
    "compatibility_date": "2025-09-16",
    "compatibility_flags": [
        "nodejs_compat"
    ],
    "assets": {
        "directory": ".output/public"
    },
    "observability": {
        "enabled": true
    },
    "vars": {
        "JWT_SECRET": PRODUCTION_JWT_SECRET || JWT_SECRET,
        "SESSION_SECRET": PRODUCTION_SESSION_SECRET || SESSION_SECRET
    },
    "d1_databases": [
        {
            "binding": "DB",
            "database_name": PRODUCTION_DATABASE_NAME,
            "database_id": PRODUCTION_DATABASE_ID,
            "migrations_dir": "drizzle",
            "preview_database_id": "DB"
        }
    ],
    "workers_dev": true,
    "env": {
        "staging": {
            "name": STAGING_WORKER_NAME,
            "vars": {
                "JWT_SECRET": STAGING_JWT_SECRET || JWT_SECRET,
                "SESSION_SECRET": STAGING_SESSION_SECRET || SESSION_SECRET
            },
            "d1_databases": [
                {
                    "binding": "DB",
                    "database_name": STAGING_DATABASE_NAME,
                    "database_id": STAGING_DATABASE_ID || DATABASE_ID,
                    "migrations_dir": "drizzle"
                }
            ],
            "workers_dev": true
        },
        "production": {
            "name": PRODUCTION_WORKER_NAME,
            "vars": {
                "JWT_SECRET": PRODUCTION_JWT_SECRET || JWT_SECRET,
                "SESSION_SECRET": PRODUCTION_SESSION_SECRET || SESSION_SECRET
            },
            "d1_databases": [
                {
                    "binding": "DB",
                    "database_name": PRODUCTION_DATABASE_NAME,
                    "database_id": PRODUCTION_DATABASE_ID,
                    "migrations_dir": "drizzle"
                }
            ],
            "workers_dev": true
        }
    }
};

const configPath = join(process.cwd(), 'wrangler.jsonc');

try {
    writeFileSync(configPath, JSON.stringify(wranglerConfig, null, '\t'));
    console.log('✅ Generated wrangler.jsonc successfully');
    console.log('\n📋 Top-level Configuration (Production):');
    console.log(`   Worker Name: ${PRODUCTION_WORKER_NAME}`);
    console.log(`   Database Name: ${PRODUCTION_DATABASE_NAME}`);
    console.log(`   Database ID: ${PRODUCTION_DATABASE_ID}`);
    if (PRODUCTION_JWT_SECRET) {
        console.log(`   🔐 JWT Secret: ${PRODUCTION_JWT_SECRET.slice(0, 8)}...${PRODUCTION_JWT_SECRET.slice(-8)} (${PRODUCTION_JWT_SECRET.length} chars)`);
    } else {
        console.log(`   🔐 JWT Secret: Using default (${JWT_SECRET.slice(0, 8)}...${JWT_SECRET.slice(-8)})`);
    }
    if (PRODUCTION_SESSION_SECRET) {
        console.log(`   🔐 Session Secret: ${PRODUCTION_SESSION_SECRET.slice(0, 8)}...${PRODUCTION_SESSION_SECRET.slice(-8)} (${PRODUCTION_SESSION_SECRET.length} chars)`);
    } else {
        console.log(`   🔐 Session Secret: Using default (${SESSION_SECRET.slice(0, 8)}...${SESSION_SECRET.slice(-8)})`);
    }

    console.log('\n📋 Staging Environment:');
    console.log(`   Worker Name: ${STAGING_WORKER_NAME}`);
    console.log(`   Database Name: ${STAGING_DATABASE_NAME}`);
    console.log(`   Database ID: ${STAGING_DATABASE_ID || DATABASE_ID}`);
    if (STAGING_JWT_SECRET) {
        console.log(`   🔐 JWT Secret: ${STAGING_JWT_SECRET.slice(0, 8)}...${STAGING_JWT_SECRET.slice(-8)} (${STAGING_JWT_SECRET.length} chars)`);
    } else {
        console.log(`   🔐 JWT Secret: Using default`);
    }
    if (STAGING_SESSION_SECRET) {
        console.log(`   🔐 Session Secret: ${STAGING_SESSION_SECRET.slice(0, 8)}...${STAGING_SESSION_SECRET.slice(-8)} (${STAGING_SESSION_SECRET.length} chars)`);
    } else {
        console.log(`   🔐 Session Secret: Using default`);
    }

    console.log('\n📋 Production Environment (explicit):');
    console.log(`   Worker Name: ${PRODUCTION_WORKER_NAME}`);
    console.log(`   Database Name: ${PRODUCTION_DATABASE_NAME}`);
    console.log(`   Database ID: ${PRODUCTION_DATABASE_ID}`);
    if (PRODUCTION_JWT_SECRET) {
        console.log(`   🔐 JWT Secret: ${PRODUCTION_JWT_SECRET.slice(0, 8)}...${PRODUCTION_JWT_SECRET.slice(-8)} (${PRODUCTION_JWT_SECRET.length} chars)`);
    } else {
        console.log(`   🔐 JWT Secret: Using default`);
    }
    if (PRODUCTION_SESSION_SECRET) {
        console.log(`   🔐 Session Secret: ${PRODUCTION_SESSION_SECRET.slice(0, 8)}...${PRODUCTION_SESSION_SECRET.slice(-8)} (${PRODUCTION_SESSION_SECRET.length} chars)`);
    } else {
        console.log(`   🔐 Session Secret: Using default`);
    }
} catch (error) {
    console.error('❌ Failed to generate wrangler.jsonc:', error);
    process.exit(1);
}