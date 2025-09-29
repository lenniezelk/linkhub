import Button from '@/components/Button';
import Container from '@/components/Container';
import Footer from '@/components/Footer';
import Input from '@/components/Input';
import Menu from '@/components/Menu';
import { createFileRoute, redirect } from '@tanstack/react-router'
import React, { useCallback } from 'react';
import { z } from 'zod';
import InPageNotifications, { useInPageNotifications } from '@/components/InPageNotifications';
import { createServerFn } from '@tanstack/react-start';
import { useAppSession } from '@/lib/useAppSession';
import { dbClient } from '@/lib/db/dbClient';
import { linksTable, profileImagesTable, themesTable, userSettingsTable } from '@/lib/db/schema';
import { asc, desc, eq } from 'drizzle-orm';
import { DashboardData, InAppTheme, LinksData, linksData, LinksErrors, LinksOnly, SocialLinkServerData } from '@/lib/types';
import { ExternalLink } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

// Import icons
import instagramIcon from '@/assets/icons/instagram.svg';
import xIcon from '@/assets/icons/x.svg';
import tiktokIcon from '@/assets/icons/tiktok.svg';
import pinterestIcon from '@/assets/icons/pinterest.svg';
import youtubeIcon from '@/assets/icons/youtube.svg';
import facebookIcon from '@/assets/icons/facebook.svg';
import linkedinIcon from '@/assets/icons/linkedin.svg';
import githubIcon from '@/assets/icons/github.svg';
import webIcon from '@/assets/icons/web.svg';
import ProfileImageEdit from '@/components/ProfileImageEdit';
import uploadProfileImage from '@/api/profile/uploadProfileImage';


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
    loader: () => fetchInitialData(),
})

const saveLinks = createServerFn({ method: 'POST' }).validator(linksData).handler(async (ctx) => {
    const db = dbClient();

    const appSession = await useAppSession();
    if (!appSession.data?.user) {
        throw redirect({ to: '/Login', replace: true });
    }

    const filteredLinksData = Object.keys(ctx.data).filter(key => !key.endsWith('Error')).reduce((obj, key) => {
        if (key in linksData.shape) {
            obj[key as keyof LinksOnly] = ctx.data[key as keyof LinksData];
        }
        return obj;
    }, {} as Partial<LinksOnly>);

    const insertData: SocialLinkServerData[] = Object.entries(filteredLinksData)
        .filter(([_, value]) => value && typeof value === 'string' && value.trim() !== '')
        .map(([key, value]) => {
            let type = key as keyof LinksOnly;
            let url = typeof value === 'string' ? value.trim() : '';
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


const fetchInitialData = createServerFn({ method: 'GET' }).handler(async () => {
    const db = dbClient();

    const appSession = await useAppSession();
    if (!appSession.data?.user) {
        throw redirect({ to: '/Login', replace: true });
    }

    const links = await db.select().from(linksTable).where(eq(linksTable.userId, appSession.data.user.id));

    const linksResult: Partial<LinksOnly> = {};
    links.forEach(link => {
        linksResult[link.type as keyof LinksOnly] = link.url;
    });

    const profileImage = await db.select().from(profileImagesTable).where(eq(profileImagesTable.userId, appSession.data.user.id)).orderBy(desc(profileImagesTable.createdAt)).limit(1);

    const themes = await db.select().from(themesTable).orderBy(asc(themesTable.name));

    // Get user's current theme selection
    const userSettings = await db.select()
        .from(userSettingsTable)
        .where(eq(userSettingsTable.userId, appSession.data.user.id))
        .limit(1);

    return {
        status: 'SUCCESS',
        data: {
            linksData: linksResult,
            profileImage: profileImage[0] || null,
            themes: themes as InAppTheme[],
            currentThemeId: userSettings[0]?.themeId || null,
            rootUrl: process.env.ROOT_URL || 'https://linkhub.link',
        }
    };
});

const updateSelectedTheme = createServerFn({ method: 'POST' }).validator(z.object({
    themeId: z.string().min(1).max(100),
})).handler(async (ctx) => {
    const appSession = await useAppSession();
    if (!appSession.data?.user) {
        throw redirect({ to: '/Login', replace: true });
    }

    const { themeId } = ctx.data;
    const db = dbClient();

    // Check if user settings record exists
    const existingRecord = await db.select()
        .from(userSettingsTable)
        .where(eq(userSettingsTable.userId, appSession.data.user.id))
        .limit(1);

    if (existingRecord.length > 0) {
        // Update existing record
        await db.update(userSettingsTable)
            .set({ themeId })
            .where(eq(userSettingsTable.userId, appSession.data.user.id));
    } else {
        // Insert new record
        await db.insert(userSettingsTable).values({
            userId: appSession.data.user.id,
            themeId: themeId,
        });
    }

    return {
        status: 'SUCCESS'
    };
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
    isSubmitting: false,
    isSubmittingProfileImage: false,
    profilePicUrl: '',
    currentThemeId: '',
    themes: [],
    rootUrl: 'https://linkhub.link',
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

const validateField = (field: keyof LinksData, value: string): string => {
    const result = linksData.shape[field].safeParse(value.trim());
    return result.success ? '' : result.error.issues[0].message;
};

const validateFields = (data: DashboardData): Partial<LinksErrors> => {
    const errors: Partial<LinksErrors> = {};
    for (const key in data) {
        if (key.endsWith('Error') || !(key in linksData.shape)) continue;
        const fieldKey = key as keyof LinksData;
        const fieldValue = data[fieldKey];
        if (typeof fieldValue === 'string') {
            const error = validateField(fieldKey, fieldValue);
            if (error) {
                const errorKey = `${key}Error` as keyof LinksErrors;
                errors[errorKey] = error;
            }
        }
    }
    return errors;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const DEFAULT_THEME_CLASS = 'bg-gradient-to-br from-rose-200 via-fuchsia-200 to-sky-200';

function RouteComponent() {
    const initialServerData = Route.useLoaderData();
    const routeContext = Route.useRouteContext();
    const [state, dispatch] = React.useReducer(reducer, initialData);
    const inPageNotifications = useInPageNotifications();

    React.useEffect(() => {
        if (initialServerData.status === 'SUCCESS' && initialServerData.data) {
            dispatch({
                type: 'SET_FIELD',
                payload: {
                    ...initialServerData.data.linksData,
                    profilePicUrl: initialServerData.data.profileImage?.imageUrl || '',
                    themes: initialServerData.data.themes || [],
                    currentThemeId: initialServerData.data.currentThemeId || '',
                    rootUrl: initialServerData.data.rootUrl || 'https://linkhub.link',
                }
            });
        }
    }, [initialServerData]);

    const submit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_FIELD', payload: { isSubmitting: true } });
        inPageNotifications.clearNotifications();

        // Validate all fields
        const errors = validateFields(state)
        const hasErrors = Object.keys(errors).length > 0;
        if (hasErrors) {
            // If there are errors, update state with errors and do not submit
            dispatch({ type: 'SET_FIELD', payload: errors });
            dispatch({ type: 'SET_FIELD', payload: { isSubmitting: false } });
            return;
        }

        // Check if user has entered at least one link
        const hasAtLeastOneLink = Object.keys(state)
            .filter(key => !key.endsWith('Error'))
            .some(field => {
                const value = state[field as keyof DashboardData];
                return typeof value === 'string' && value.trim() !== '';
            });

        if (!hasAtLeastOneLink) {
            inPageNotifications.addNotification({
                type: 'error',
                message: 'Please enter at least one social media link or website before submitting.',
                keepForever: true
            });
            dispatch({ type: 'SET_FIELD', payload: { isSubmitting: false } });
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
            dispatch({ type: 'SET_FIELD', payload: { isSubmitting: false } });
        });
    }, [state, inPageNotifications]);

    const submitProfileImage = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        inPageNotifications.clearNotifications();
        dispatch({ type: 'SET_FIELD', payload: { isSubmittingProfileImage: true } });

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        uploadProfileImage({ data: formData }).then((result) => {
            if (result.status === 'SUCCESS') {
                if (result.data?.thumbnail) {
                    dispatch({ type: 'SET_FIELD', payload: { profilePicUrl: result.data.thumbnail } });
                    inPageNotifications.addNotification({ type: 'success', message: 'Profile image uploaded successfully!' });
                } else if (result.data?.original) {
                    dispatch({ type: 'SET_FIELD', payload: { profilePicUrl: result.data.original } });
                    inPageNotifications.addNotification({ type: 'success', message: 'Profile image uploaded successfully!' });
                }
            } else {
                inPageNotifications.addNotification({ type: 'error', message: result.message, keepForever: true });
            }
        }).catch(error => {
            inPageNotifications.addNotification({ type: 'error', message: 'An unexpected error occurred. Please try again later.', keepForever: true });
            console.error('Error uploading profile image:', error);
        }).finally(() => {
            dispatch({ type: 'SET_FIELD', payload: { isSubmittingProfileImage: false } });
        });
    }, [inPageNotifications]);

    const getCurrentTheme = useCallback(() => {
        const currentTheme = state.themes.find(theme => theme.id === state.currentThemeId);
        return currentTheme ? currentTheme.gradientClass : DEFAULT_THEME_CLASS;
    }, [state.themes, state.currentThemeId]);

    const handleThemeSelection = useCallback((themeId: string) => {
        // Update local state immediately
        dispatch({ type: 'SET_FIELD', payload: { currentThemeId: themeId } });

        // Save to database in background
        updateSelectedTheme({ data: { themeId } }).catch(error => {
            console.error('Error saving theme selection:', error);
            inPageNotifications.addNotification({
                type: 'error',
                message: 'Failed to save theme selection. Please try again.',
                keepForever: true
            });
        });
    }, [inPageNotifications]);

    return (
        <Container gradientClass={getCurrentTheme()}>
            <Menu context={{ user: routeContext.user, userProfile: routeContext.userProfile }} />
            <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
                <InPageNotifications />
                <div className='mt-4 flex justify-end w-full max-w-md px-4'>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <a href={`${state.rootUrl}/p/${routeContext.user?.handle}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white hover:bg-opacity-20 transition-colors">
                                <ExternalLink className='text-slate-700 h-5 w-5' />
                            </a>
                        </TooltipTrigger>
                        <TooltipContent
                            side="bottom"
                            sideOffset={8}
                            className="bg-slate-800 text-white px-3 py-2 rounded-md shadow-lg"
                        >
                            <p>Go to your public profile</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className='flex flex-col items-center px-4 mt-8'>
                    <ProfileImageEdit
                        imageUrl={state.profilePicUrl}
                        submitProfileImage={submitProfileImage}
                        isSubmittingProfileImage={state.isSubmittingProfileImage}
                    />
                </div>
                {state.themes.length > 0 && (
                    <div className='flex flex-col items-center p-3 mt-6 border rounded-sm border-sm-slate-900 w-full max-w-md'>
                        <p className='text-lg font-medium text-gray-700'>Choose a Theme</p>
                        <div className='flex space-x-4 mt-2 bg-white p-3 rounded-sm'>
                            {state.themes.map((theme) => {
                                const isSelected = theme.id === state.currentThemeId;

                                return <div
                                    key={theme.id}
                                    className={`w-8 h-8 rounded-full cursor-pointer ${theme.gradientClass} border-2 hover:border-slate-900 ${isSelected ? 'border-slate-900' : 'border-transparent'}`}
                                    title={theme.name}
                                    onClick={() => handleThemeSelection(theme.id)}
                                />
                            })}
                        </div>
                    </div>)}
                <form noValidate className="mt-6 flex flex-col items-start gap-8 px-4 max-w-md w-full" onSubmit={submit}>
                    <div className='flex items-center w-full'>
                        <label htmlFor="instagram" className='mr-2 flex-shrink-0'>
                            <img src={instagramIcon} alt="Instagram" className='h-8 w-8' />
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
                            <img src={xIcon} alt="Twitter" className='h-8 w-8' />
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
                            <img src={tiktokIcon} alt="TikTok" className='h-8 w-8' />
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
                            <img src={pinterestIcon} alt="Pinterest" className='h-8 w-8' />
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
                            <img src={youtubeIcon} alt="YouTube" className='h-8 w-8' />
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
                            <img src={facebookIcon} alt="Facebook" className='h-8 w-8' />
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
                            <img src={linkedinIcon} alt="LinkedIn" className='h-8 w-8' />
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
                            <img src={githubIcon} alt="GitHub" className='h-8 w-8' />
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
                            <img src={webIcon} alt="Website" className='h-8 w-8' />
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
                        <Button type="submit" disabled={state.isSubmitting}>{state.isSubmitting ? 'Submitting...' : 'Submit'}</Button>
                    </div>
                </form>
            </main>
            <Footer />
        </Container>
    )
}
