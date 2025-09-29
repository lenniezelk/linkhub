import { useAppSession } from '@/lib/useAppSession';
import { createServerFn } from '@tanstack/react-start';
import { redirect } from '@tanstack/react-router'
import { dbClient } from '@/lib/db/dbClient';
import { profileImagesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const uploadProfileImage = createServerFn({ method: 'POST' })
    .validator((formData: FormData) => {
        if (!(formData instanceof FormData)) {
            throw new Error('Invalid form data');
        }
        const file = formData.get('fileUpload');
        if (!(file instanceof File)) {
            throw new Error('No file uploaded');
        }
        if (file.size === 0) {
            throw new Error('Uploaded file is empty');
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
        return file;
    }).handler(async (ctx) => {
        const appSession = await useAppSession();
        if (!appSession.data?.user) {
            throw redirect({ to: '/Login', replace: true });
        }

        const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`;

        // Create a new FormData for Cloudflare API
        const cloudflareFormData = new FormData();
        cloudflareFormData.append('file', ctx.data);
        cloudflareFormData.append('requireSignedURLs', 'false');
        cloudflareFormData.append('metadata', JSON.stringify({ creator: appSession.data.user.id }));

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.CLOUDFLARE_STREAM_IMAGES_ANALYTICS_TOKEN}`,
                // Don't set Content-Type for FormData - browser sets it automatically with boundary
            },
            body: cloudflareFormData
        });

        if (!response.ok) {
            console.error('Cloudflare response not ok:', response.status, await response.text());
            return {
                status: 'ERROR',
                message: `Image upload failed with status ${response.status}`
            }
        }

        const data = await response.json() as {
            success: boolean;
            errors: any[];
            messages: any[];
            result: {
                id: string;
                filename: string;
                uploaded: string;
                requireSignedURLs: boolean;
                variants: string[];
                meta: Record<string, any>;
            };
        };

        if (!data.success) {
            return {
                status: 'ERROR',
                message: `Image upload failed: ${data.errors.map(e => e.message).join(', ')}`
            }
        }

        if (data.result.variants.length === 0) {
            return {
                status: 'ERROR',
                message: 'No image variants returned from Cloudflare'
            }
        }

        const insertData = data.result.variants.map(variantUrl => ({
            userId: appSession.data!.user!.id!,
            imageUrl: variantUrl,
            variant: variantUrl.includes('/thumbnail/') ? 'thumbnail' :
                variantUrl.includes('/hero/') ? 'hero' : 'original',
            requiresSignedUrl: false, // Changed to false since we're using public URLs
        }));

        const imageVariants: {
            thumbnail?: string;
            original?: string;
            hero?: string;
        } = {};

        for (const item of insertData) {
            if (item.variant === 'thumbnail') {
                imageVariants.thumbnail = item.imageUrl;
            } else if (item.variant === 'hero') {
                imageVariants.hero = item.imageUrl;
            } else if (item.variant === 'original') {
                imageVariants.original = item.imageUrl;
            }
        }

        const db = dbClient();
        await db.delete(profileImagesTable).where(eq(profileImagesTable.userId, appSession.data.user.id));
        await db.insert(profileImagesTable).values(insertData);

        return {
            status: 'SUCCESS', data: imageVariants
        }
    });

export default uploadProfileImage;