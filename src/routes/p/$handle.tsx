import Container from '@/components/Container';
import Menu from '@/components/Menu';
import ProfileImage from '@/components/ProfileImage';
import { dbClient } from '@/lib/db/dbClient';
import { linksTable, profileImagesTable, themesTable, userSettingsTable, usersTable } from '@/lib/db/schema';
import { InAppTheme, LinksOnly } from '@/lib/types';
import { createFileRoute, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start';
import { asc, desc, eq } from 'drizzle-orm';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

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

const iconsMap: Record<string, string> = {
    instagram: instagramIcon,
    twitter: xIcon,
    tiktok: tiktokIcon,
    pinterest: pinterestIcon,
    youtube: youtubeIcon,
    facebook: facebookIcon,
    linkedin: linkedinIcon,
    github: githubIcon,
    website: webIcon,
};


export const Route = createFileRoute('/p/$handle')({
    component: RouteComponent,
    loader: (ctx) => fetchInitialData({ data: { handle: ctx.params.handle } }),
})

const fetchInitialData = createServerFn({ method: 'GET' }).validator(z.object({ handle: z.string() })).handler(async (ctx) => {
    const db = dbClient();
    const handle = ctx.data.handle;

    const user = await db.select().from(usersTable).where(eq(usersTable.handle, handle)).limit(1);
    if (user.length === 0) {
        throw notFound();
    }

    const links = await db.select().from(linksTable).where(eq(linksTable.userId, user[0].id));

    const linksResult: Partial<LinksOnly> = {};
    links.forEach(link => {
        linksResult[link.type as keyof LinksOnly] = link.url;
    });

    const profileImage = await db.select().from(profileImagesTable).where(eq(profileImagesTable.userId, user[0].id)).orderBy(desc(profileImagesTable.createdAt)).limit(1);

    const themes = await db.select().from(themesTable).orderBy(asc(themesTable.name));

    // Get user's current theme selection
    const userSettings = await db.select()
        .from(userSettingsTable)
        .where(eq(userSettingsTable.userId, user[0].id))
        .limit(1);

    return {
        status: 'SUCCESS',
        data: {
            linksData: linksResult,
            profileImage: profileImage[0] || null,
            themes: themes as InAppTheme[],
            currentThemeId: userSettings[0]?.themeId || null,
        }
    };
});

const DEFAULT_THEME_CLASS = 'bg-gradient-to-br from-rose-200 via-fuchsia-200 to-sky-200';

const linksOnlyValues: (keyof LinksOnly)[] = [
    'instagram',
    'twitter',
    'tiktok',
    'pinterest',
    'youtube',
    'facebook',
    'linkedin',
    'github',
    'website',
];

function RouteComponent() {
    const data = Route.useLoaderData();
    const localData = data.data

    const getCurrentTheme = useCallback(() => {
        const currentTheme = localData.themes.find(theme => theme.id === localData.currentThemeId);
        return currentTheme ? currentTheme.gradientClass : DEFAULT_THEME_CLASS;
    }, [localData.themes, localData.currentThemeId]);

    const linksWithUrls = useMemo(() => linksOnlyValues.filter(linkType => localData.linksData[linkType]), [localData.linksData]);

    return (
        <Container gradientClass={getCurrentTheme()}>
            <Menu />
            <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
                <div className='flex flex-col items-center px-4'>
                    <div className="w-[200px] h-[200px]">
                        <ProfileImage imageUrl={localData.profileImage.imageUrl} />
                    </div>
                </div>
                {linksWithUrls.length > 0 ? (
                    <div className="mt-10 w-full max-w-md flex flex-col items-center space-y-4">
                        {linksWithUrls.map((linkType) => (
                            <a
                                key={linkType}
                                href={localData.linksData[linkType]}
                                className="flex items-center space-x-3 px-6 py-4 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200 w-full"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <img
                                    src={iconsMap[linkType]}
                                    alt={linkType}
                                    className="h-6 w-6"
                                />
                                <span className="text-gray-800 font-medium capitalize">{linkType}</span>
                            </a>
                        ))}
                    </div>
                ) : (
                    <p className="mt-10 text-gray-500">No links available</p>
                )}
            </main>
        </Container>
    )
}