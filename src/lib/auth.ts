import * as jose from 'jose'
import type { User, JWTPayload } from './types';

// Helper functions to convert between formats
const hex = (buff: ArrayBuffer) => [...new Uint8Array(buff)].map(b => b.toString(16).padStart(2, '0')).join('');
const unhex = (str: string) => new Uint8Array(str.match(/.{1,2}/g)!.map(byte => Number.parseInt(byte, 16)));

const PBKDF2_ITERATIONS = 100000; // Standard number of iterations

/**
 * Hashes a password with a random salt using PBKDF2.
 * @param password The password to hash.
 * @returns A string in the format "iterations:salt:hash"
 */
export async function hashPassword(password: string): Promise<string> {
    // 1. Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // 2. Import the password as a cryptographic key
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );

    // 3. Derive the hash using PBKDF2
    const hashBuffer = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt.buffer,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        key,
        256 // 256 bits (32 bytes)
    );

    // 4. Store iterations, salt, and hash together
    return `${PBKDF2_ITERATIONS}:${hex(salt.buffer)}:${hex(hashBuffer)}`;
}

/**
 * Verifies a password against a stored PBKDF2 hash.
 * @param password The password attempt.
 * @param storedHash The "iterations:salt:hash" string from your database.
 * @returns True if the password is correct.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    // 1. Split the stored string to get the original parameters
    const [iterationsStr, saltHex, hashHex] = storedHash.split(':');
    const iterations = Number.parseInt(iterationsStr, 10);
    const saltBuffer = unhex(saltHex);

    // 2. Re-hash the incoming password with the same parameters
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );

    const hashBufferAttempt = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: saltBuffer.buffer,
            iterations: iterations,
            hash: 'SHA-256',
        },
        key,
        256
    );

    // 3. Compare the new hash with the stored hash
    const hashAttemptHex = hex(hashBufferAttempt);
    return hashAttemptHex === hashHex;
}

// JWT Functions using Jose library
const getJWTSecret = (): string => {
    // For Cloudflare Workers/Pages, environment variables are available via globalThis
    const secret = import.meta.env.DEV
        ? '6ddebf6d2eb6d5fe8204c31e0c2a141d14a8fbbd9cd741aa4ac33057a882365e19f3636ece2c156d9109e9c9f48d8043ebf7135c85a5a5c683a4f6179bacf415'
        : process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required');
    }

    // Ensure minimum length for security
    if (secret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    return secret;
};

/**
 * Creates a JWT token for a user using Jose library
 * @param user User data to encode in the token
 * @returns JWT token string
 */
export async function createJWT(user: User): Promise<string> {
    const secret = new TextEncoder().encode(getJWTSecret());

    const jwt = await new jose.SignJWT({
        email: user.email,
        name: user.name,
        handle: user.handle,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setSubject(user.id)
        .setExpirationTime('7d')
        .sign(secret);

    return jwt;
}

/**
 * Verifies and decodes a JWT token using Jose library
 * @param token JWT token to verify
 * @returns Decoded payload if valid, null if invalid
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
    try {
        const secret = new TextEncoder().encode(getJWTSecret());

        const { payload } = await jose.jwtVerify(token, secret);

        // Jose automatically handles expiration checking
        return {
            sub: payload.sub as string,
            email: payload.email as string,
            name: payload.name as string,
            handle: payload.handle as string | null,
            iat: payload.iat as number,
            exp: payload.exp as number,
        };
    } catch (error) {
        // Jose throws errors for invalid/expired tokens
        console.error('JWT verification error:', error);
        return null;
    }
}