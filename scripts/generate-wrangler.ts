#!/usr/bin/env tsx

import { writeFileSync } from 'fs';
import { join } from 'path';

// Get environment variables
const DATABASE_ID = process.env.DATABASE_ID || process.env.CLOUDFLARE_DATABASE_ID;
const DATABASE_NAME = process.env.DATABASE_NAME || 'linkhub-prod';
const WORKER_NAME = process.env.WORKER_NAME || 'linkhub';

if (!DATABASE_ID) {
    console.error('❌ DATABASE_ID environment variable is required');
    console.error('Set it with: export DATABASE_ID=your-database-id');
    process.exit(1);
}

const wranglerConfig = {
    "$schema": "./node_modules/wrangler/config-schema.json",
    "name": WORKER_NAME,
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
    "d1_databases": [
        {
            "binding": "DB",
            "database_name": DATABASE_NAME,
            "database_id": DATABASE_ID,
            "migrations_dir": "drizzle",
            "preview_database_id": "DB"
        }
    ]
};

const configPath = join(process.cwd(), 'wrangler.jsonc');

try {
    writeFileSync(configPath, JSON.stringify(wranglerConfig, null, '\t'));
    console.log('✅ Generated wrangler.jsonc successfully');
    console.log(`📋 Database ID: ${DATABASE_ID}`);
    console.log(`📋 Database Name: ${DATABASE_NAME}`);
    console.log(`📋 Worker Name: ${WORKER_NAME}`);
} catch (error) {
    console.error('❌ Failed to generate wrangler.jsonc:', error);
    process.exit(1);
}