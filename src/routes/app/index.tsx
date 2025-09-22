import Button from '@/components/Button';
import Container from '@/components/Container';
import Footer from '@/components/Footer';
import Input from '@/components/Input';
import Menu from '@/components/Menu';
import { createFileRoute, redirect } from '@tanstack/react-router'
import React, { useCallback } from 'react';
import { z } from 'zod';

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
})

const dashboardData = z.object({
    instagram: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/).optional(),
    instagramError: z.string().optional(),
    twitter: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/).optional(),
    twitterError: z.string().optional(),
    github: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/).optional(),
    githubError: z.string().optional(),
    linkedin: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/).optional(),
    linkedinError: z.string().optional(),
    website: z.string().url().optional(),
    websiteError: z.string().optional(),
    tiktok: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/).optional(),
    tiktokError: z.string().optional(),
    youtube: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/).optional(),
    youtubeError: z.string().optional(),
    pinterest: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/).optional(),
    pinterestError: z.string().optional(),
    facebook: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/).optional(),
    facebookError: z.string().optional(),
});

interface DashboardData extends z.infer<typeof dashboardData> { };

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

function RouteComponent() {
    const routeContext = Route.useRouteContext();
    const [state, dispatch] = React.useReducer(reducer, initialData);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const submit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate all fields
        const errors = validateFields(state);
        if (Object.keys(errors).length > 0) {
            // If there are errors, update state with errors and do not submit
            dispatch({ type: 'SET_FIELD', payload: errors });
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(false);
        // Submit logic here (e.g., API call)
        console.log('Form submitted successfully with data:', state);
    }, [state]);

    return (
        <Container>
            <Menu user={routeContext.user} />
            <main className="flex flex-col items-center mt-12 min-h-[calc(100vh-12rem)]">
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
