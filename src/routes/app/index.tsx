import Button from '@/components/Button';
import Container from '@/components/Container';
import Footer from '@/components/Footer';
import Input from '@/components/Input';
import Menu from '@/components/Menu';
import { createFileRoute, redirect } from '@tanstack/react-router'
import React, { useCallback, useState } from 'react';
import { z } from 'zod';
import InPageNotifications, { useInPageNotifications } from '@/components/InPageNotifications';
import { createServerFn } from '@tanstack/react-start';
import { useAppSession } from '@/lib/useAppSession';
import { dbClient } from '@/lib/db/dbClient';
import { linksTable, profileImagesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SocialLinkServerData } from '@/lib/types';
import ProfileImage from '@/components/ProfileImage';


export const Route = createFileRoute('/app/')({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        if (!context.user) {
            throw redirect({ to: '/Login' });
        }
        if (context.user && !context.user.handle) {
            throw redirect({ to: '/app/createHandle' });
        }
    },
    loader: () => fetchLinks(),
})

const dashboardData = z.object({
    instagram: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 30 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "Instagram handle must be 1-30 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    instagramError: z.string().optional(),
    twitter: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 15 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "X handle must be 1-15 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    twitterError: z.string().optional(),
    github: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 39 && /^[a-zA-Z0-9._-]+$/.test(val)), {
        message: "GitHub username must be 1-39 characters and contain only letters, numbers, dots, hyphens, and underscores"
    }).optional(),
    githubError: z.string().optional(),
    linkedin: z.string().refine((val) => val === '' || (val.length >= 3 && val.length <= 100 && /^[a-zA-Z0-9-]+$/.test(val)), {
        message: "LinkedIn profile must be 3-100 characters and contain only letters, numbers, and hyphens"
    }).optional(),
    linkedinError: z.string().optional(),
    website: z.string().refine((val) => val === '' || z.string().url().safeParse(val).success, {
        message: "Please enter a valid URL"
    }).optional(),
    websiteError: z.string().optional(),
    tiktok: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 24 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "TikTok handle must be 1-24 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    tiktokError: z.string().optional(),
    youtube: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 100 && /^[a-zA-Z0-9._-]+$/.test(val)), {
        message: "YouTube channel must be 1-100 characters and contain only letters, numbers, dots, hyphens, and underscores"
    }).optional(),
    youtubeError: z.string().optional(),
    pinterest: z.string().refine((val) => val === '' || (val.length >= 3 && val.length <= 30 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "Pinterest handle must be 3-30 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    pinterestError: z.string().optional(),
    facebook: z.string().refine((val) => val === '' || (val.length >= 1 && val.length <= 50 && /^[a-zA-Z0-9._]+$/.test(val)), {
        message: "Facebook profile must be 1-50 characters and contain only letters, numbers, dots, and underscores"
    }).optional(),
    facebookError: z.string().optional(),
});

type DashboardData = z.infer<typeof dashboardData>;

// Type for error fields only
type DashboardErrors = {
    instagramError?: string;
    twitterError?: string;
    githubError?: string;
    linkedinError?: string;
    websiteError?: string;
    tiktokError?: string;
    youtubeError?: string;
    pinterestError?: string;
    facebookError?: string;
};

// Type for links data only (DashboardData without error fields)
type DashboardLinks = Omit<DashboardData, keyof DashboardErrors>;

const saveLinks = createServerFn({ method: 'POST' }).validator(dashboardData).handler(async (ctx) => {
    const db = dbClient();

    const appSession = await useAppSession();
    if (!appSession.data?.user) {
        throw redirect({ to: '/Login', replace: true });
    }

    const linksData = Object.keys(ctx.data).filter(key => !key.endsWith('Error')).reduce((obj, key) => {
        obj[key as keyof DashboardLinks] = ctx.data[key as keyof DashboardData];
        return obj;
    }, {} as DashboardLinks);

    const insertData: SocialLinkServerData[] = Object.entries(linksData)
        .filter(([_, value]) => value && value.trim() !== '')
        .map(([key, value]) => {
            let type = key as keyof DashboardLinks;
            let url = value ? value.trim() : '';
            return { type, url };
        });

    if (insertData.length === 0) {
        return {
            status: 'ERROR',
            message: 'No valid links to update.'
        }
    }

    await db.delete(linksTable).where(eq(linksTable.userId, appSession.data.user.id));

    await db.insert(linksTable).values(insertData.map(link => ({
        userId: appSession.data!.user!.id,
        type: link.type,
        url: link.url,
    })));

    return { status: 'SUCCESS' };
});


const fetchLinks = createServerFn({ method: 'GET' }).handler(async (ctx) => {
    const db = dbClient();

    const appSession = await useAppSession();
    if (!appSession.data?.user) {
        throw redirect({ to: '/Login', replace: true });
    }

    const links = await db.select().from(linksTable).where(eq(linksTable.userId, appSession.data.user.id));

    const linksData: Partial<DashboardLinks> = {};
    links.forEach(link => {
        linksData[link.type as keyof DashboardLinks] = link.url;
    });

    return {
        status: 'SUCCESS', data: linksData as Partial<DashboardLinks>
    };
});

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
            console.log('Cloudflare response not ok:', response.status, await response.text());
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

type DashboardReducerAction =
    | { type: 'SET_FIELD'; payload: Partial<DashboardData> }

const initialData: DashboardData = {
    instagram: '',
    instagramError: '',
    twitter: '',
    twitterError: '',
    github: '',
    githubError: '',
    linkedin: '',
    linkedinError: '',
    website: '',
    websiteError: '',
    tiktok: '',
    tiktokError: '',
    youtube: '',
    youtubeError: '',
    pinterest: '',
    pinterestError: '',
    facebook: '',
    facebookError: '',
};

const reducer = (state: DashboardData, action: DashboardReducerAction): DashboardData => {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, ...action.payload };
        default:
            return state;
    }
};

const Prefix = ({ text }: { text?: string }) => <span className="font-mono text-base font-semibold text-slate-800">
    {text ? text : '@'}
</span>

const validateField = (field: keyof DashboardData, value: string): string => {
    const result = dashboardData.shape[field].safeParse(value.trim());
    return result.success ? '' : result.error.issues[0].message;
};

const validateFields = (data: DashboardData): Partial<DashboardErrors> => {
    const errors: Partial<DashboardErrors> = {};
    for (const key in data) {
        if (key.endsWith('Error')) continue;
        const fieldKey = key as keyof DashboardData;
        const error = validateField(fieldKey, data[fieldKey] || '');
        if (error) {
            const errorKey = `${key}Error` as keyof DashboardErrors;
            errors[errorKey] = error;
        }
    }
    return errors;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function RouteComponent() {
    const links = Route.useLoaderData();
    const routeContext = Route.useRouteContext();
    const [state, dispatch] = React.useReducer(reducer, initialData);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const inPageNotifications = useInPageNotifications();
    const [profilePicUrl, setProfilePicUrl] = useState('');
    const [isSubmittingProfileImage, setIsSubmittingProfileImage] = useState(false);

    React.useEffect(() => {
        if (links.status === 'SUCCESS' && links.data) {
            dispatch({ type: 'SET_FIELD', payload: links.data });
        }
    }, [links]);

    const submit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        inPageNotifications.clearNotifications();

        // Validate all fields
        const errors = validateFields(state)
        const hasErrors = Object.keys(errors).length > 0;
        if (hasErrors) {
            // If there are errors, update state with errors and do not submit
            dispatch({ type: 'SET_FIELD', payload: errors });
            setIsSubmitting(false);
            return;
        }

        // Check if user has entered at least one link
        const hasAtLeastOneLink = Object.keys(state)
            .filter(key => !key.endsWith('Error'))
            .some(field => {
                const value = state[field as keyof DashboardData];
                return value && value.trim() !== '';
            });

        if (!hasAtLeastOneLink) {
            inPageNotifications.addNotification({
                type: 'error',
                message: 'Please enter at least one social media link or website before submitting.',
                keepForever: true
            });
            setIsSubmitting(false);
            return;
        }

        saveLinks({ data: state }).then((result) => {
            if (result.status === 'SUCCESS') {
                inPageNotifications.addNotification({ type: 'success', message: 'Profile updated successfully!' });
            } else {
                inPageNotifications.addNotification({ type: 'error', message: result.message, keepForever: true });
            }
        }).catch(error => {
            inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
            console.error('Error submitting links:', error);
        }).finally(() => {
            setIsSubmitting(false);
        });
    }, [state, inPageNotifications]);

    const submitProfileImage = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        inPageNotifications.clearNotifications();
        setIsSubmittingProfileImage(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        uploadProfileImage({ data: formData }).then((result) => {
            if (result.status === 'SUCCESS') {
                if (result.data?.thumbnail) {
                    setProfilePicUrl(result.data.thumbnail);
                    inPageNotifications.addNotification({ type: 'success', message: 'Profile image uploaded successfully!' });
                } else if (result.data?.original) {
                    setProfilePicUrl(result.data.original);
                    inPageNotifications.addNotification({ type: 'success', message: 'Profile image uploaded successfully!' });
                }
            } else {
                inPageNotifications.addNotification({ type: 'error', message: result.message, keepForever: true });
            }
        }).catch(error => {
            inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
            console.error('Error uploading profile image:', error);
        }).finally(() => {
            setIsSubmittingProfileImage(false);
        });
    }, [inPageNotifications]);

    return (
        <Container>
            <Menu user={routeContext.user} />
            <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
                <InPageNotifications />
                <div className='flex flex-col items-center px-4'>
                    <div className="w-[200px] h-[200px]">
                        <ProfileImage imageUrl={profilePicUrl} />
                    </div>
                    <form noValidate className='mt-4' onSubmit={submitProfileImage} encType='multipart/form-data'>
                        <label
                            htmlFor="fileUpload"
                            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            aria-disabled={isSubmittingProfileImage}
                        >
                            {isSubmittingProfileImage ? 'Uploading...' : 'Choose a Profile Image'}
                        </label>
                        <input
                            type="file"
                            id="fileUpload"
                            name="fileUpload"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    e.target.form?.requestSubmit();
                                }
                            }}
                            disabled={isSubmittingProfileImage}
                        />
                    </form>
                </div>
                <form noValidate className="mt-6 flex flex-col items-start gap-8 px-4 max-w-md w-full" onSubmit={submit}>
                    <div className='flex items-center w-full'>
                        <label htmlFor="instagram" className='mr-2 flex-shrink-0'>
                            <img src="/icons/instagram.svg" alt="Instagram" className='h-8 w-8' />
                        </label>
                        <Input
                            type="text"
                            id="instagram"
                            name="instagram"
                            placeholder="Enter your Instagram handle"
                            inputPrefix={<Prefix />}
                            className='pl-[3ch]'
                            value={state.instagram}
                            error={state.instagramError}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { instagram: e.target.value, instagramError: validateField('instagram', e.target.value) } })}
                        />
                    </div>
                    <div className='flex items-center w-full'>
                        <label htmlFor="twitter" className='mr-2 flex-shrink-0'>
                            <img src="/icons/x.svg" alt="Twitter" className='h-8 w-8' />
                        </label>
                        <Input
                            type="text"
                            id="twitter"
                            name="twitter"
                            placeholder="Enter your X handle"
                            inputPrefix={<Prefix />}
                            className='pl-[3ch]'
                            value={state.twitter}
                            error={state.twitterError}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { twitter: e.target.value, twitterError: validateField('twitter', e.target.value) } })}
                        />
                    </div>
                    <div className='flex items-center w-full'>
                        <label htmlFor="tiktok" className='mr-2 flex-shrink-0'>
                            <img src="/icons/tiktok.svg" alt="TikTok" className='h-8 w-8' />
                        </label>
                        <Input
                            type="text"
                            id="tiktok"
                            name="tiktok"
                            placeholder="Enter your TikTok handle"
                            inputPrefix={<Prefix />}
                            className='pl-[3ch]'
                            value={state.tiktok}
                            error={state.tiktokError}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { tiktok: e.target.value, tiktokError: validateField('tiktok', e.target.value) } })}
                        />
                    </div>
                    <div className='flex items-center w-full'>
                        <label htmlFor="pinterest" className='mr-2 flex-shrink-0'>
                            <img src="/icons/pinterest.svg" alt="Pinterest" className='h-8 w-8' />
                        </label>
                        <Input
                            type="text"
                            id="pinterest"
                            name="pinterest"
                            placeholder="Enter your Pinterest handle"
                            inputPrefix={<Prefix />}
                            className='pl-[3ch]'
                            value={state.pinterest}
                            error={state.pinterestError}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { pinterest: e.target.value, pinterestError: validateField('pinterest', e.target.value) } })}
                        />
                    </div>
                    <div className='flex items-center w-full'>
                        <label htmlFor="youtube" className='mr-2 flex-shrink-0'>
                            <img src="/icons/youtube.svg" alt="YouTube" className='h-8 w-8' />
                        </label>
                        <Input
                            type="text"
                            id="youtube"
                            name="youtube"
                            placeholder="Enter your YouTube channel"
                            inputPrefix={<Prefix />}
                            className='pl-[3ch]'
                            value={state.youtube}
                            error={state.youtubeError}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { youtube: e.target.value, youtubeError: validateField('youtube', e.target.value) } })}
                        />
                    </div>
                    <div className='flex items-center w-full'>
                        <label htmlFor="facebook" className='mr-2 flex-shrink-0'>
                            <img src="/icons/facebook.svg" alt="Facebook" className='h-8 w-8' />
                        </label>
                        <Input
                            type="text"
                            id="facebook"
                            name="facebook"
                            placeholder="Enter your Facebook profile"
                            inputPrefix={<Prefix />}
                            className='pl-[3ch]'
                            value={state.facebook}
                            error={state.facebookError}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { facebook: e.target.value, facebookError: validateField('facebook', e.target.value) } })}
                        />
                    </div>
                    <div className='flex items-center w-full'>
                        <label htmlFor="linkedin" className='mr-2 flex-shrink-0'>
                            <img src="/icons/linkedin.svg" alt="LinkedIn" className='h-8 w-8' />
                        </label>
                        <Input
                            type="text"
                            id="linkedin"
                            name="linkedin"
                            placeholder="Enter your LinkedIn profile"
                            inputPrefix={<Prefix text="linkedin.com/in/" />}
                            className='pl-[17ch]'
                            value={state.linkedin}
                            error={state.linkedinError}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { linkedin: e.target.value, linkedinError: validateField('linkedin', e.target.value) } })}
                        />
                    </div>
                    <div className='flex items-center w-full'>
                        <label htmlFor="github" className='mr-2 flex-shrink-0'>
                            <img src="/icons/github.svg" alt="GitHub" className='h-8 w-8' />
                        </label>
                        <Input
                            type="text"
                            id="github"
                            name="github"
                            placeholder="Enter your GitHub profile"
                            inputPrefix={<Prefix />}
                            className='pl-[3ch]'
                            value={state.github}
                            error={state.githubError}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { github: e.target.value, githubError: validateField('github', e.target.value) } })}
                        />
                    </div>
                    <div className='flex items-center w-full'>
                        <label htmlFor="website" className='mr-2 flex-shrink-0'>
                            <img src="/icons/web.svg" alt="Website" className='h-8 w-8' />
                        </label>
                        <Input
                            type="url"
                            id="website"
                            name="website"
                            placeholder="Enter your website URL"
                            className='pl-[3ch]'
                            value={state.website}
                            error={state.websiteError}
                            onChange={(e) => dispatch({ type: 'SET_FIELD', payload: { website: e.target.value, websiteError: validateField('website', e.target.value) } })}
                        />
                    </div>
                    <div className="w-full flex justify-center">
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</Button>
                    </div>
                </form>
            </main>
            <Footer />
        </Container>
    )
}
