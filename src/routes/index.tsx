import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import Connect from '@/components/Connect'
import { Share } from '@/components/Share'
import AllLinks from '@/components/AllLinks'
import { Telemetry } from '@/components/Telemetry'
import { EasySharing } from '@/components/EasySharing'
import Container from '@/components/Container'
import Menu from '@/components/Menu'
import Footer from '@/components/Footer'
import Testimonials from '@/components/Testimonials'


export const Route = createFileRoute('/')({
    head: () => ({
        meta: [
            {
                title: 'LinkHub | Home',
            },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const [handle, setHandle] = useState('')
    const routeContext = Route.useRouteContext();

    return (
        <Container>
            {/* Top navigation */}
            <Menu user={routeContext.user} />

            {/* Hero section 1 */}
            <section className="mt-12 grid min-h-[calc(100vh-6rem)] grid-cols-1 content-center gap-8 md:grid-cols-2 md:items-center">
                {/* Left: copy + input */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        The only link you'll ever need.
                    </h1>
                    <p className="mt-3 text-base leading-7 text-slate-700">
                        Connect your audience to all your content with one simple link. Perfect for your
                        social media bio.
                    </p>

                    <form className="mt-6" onSubmit={(e) => e.preventDefault()}>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <label htmlFor="claim-handle" className="sr-only">
                                Your URL
                            </label>
                            <div className="relative w-full max-w-md">
                                <input
                                    id="claim-handle"
                                    type="text"
                                    inputMode="text"
                                    placeholder="yourname"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    className="w-full rounded-full bg-white/80 py-2.5 pl-[14ch] pr-4 text-slate-900 shadow-sm ring-1 ring-white/60 backdrop-blur placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                />
                                <span
                                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 select-none font-mono text-base font-semibold text-slate-800 z-10"
                                    aria-hidden="true"
                                >
                                    linkhub.link/
                                </span>
                            </div>
                            <Link
                                to={`/Signup`}
                                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                                search={{ handle }}
                            >
                                Claim your URL
                            </Link>
                        </div>
                    </form>
                </div>

                {/* Right: Rive placeholder */}
                <div className="relative border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                    <div className="aspect-[16/12] w-full">
                        <Connect />
                    </div>
                </div>
            </section>

            {/* Hero section 2 (swapped) */}
            <section className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center py-12">
                {/* Left: Rive placeholder */}
                <div className="relative border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                    <div className="aspect-[16/12] w-full">
                        <Share />
                    </div>
                </div>

                {/* Right: copy + CTA */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Share everything with a single link
                    </h2>
                    <p className="mt-3 text-base leading-7 text-slate-700">
                        Create your profile in minutes and let your audience find all your content in one place.
                    </p>

                    <div className="mt-6">
                        <a
                            href="#"
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                        >
                            Start for free
                        </a>
                    </div>
                </div>
            </section>

            {/* Features section */}
            <section className="mt-20 pb-20">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Features
                    </h2>
                    <p className="mt-2 text-base text-slate-700">
                        Everything you need to share your world with one link.
                    </p>
                </div>

                <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {/* Feature 1 */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative w-full border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                            <div className="aspect-[16/12] w-full">
                                <AllLinks />
                            </div>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">All your links</h3>
                        <p className="mt-1 text-sm text-slate-700 max-w-sm">
                            Collect links to content, products, and profiles in one place.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative w-full border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                            <div className="aspect-[16/12] w-full">
                                <Telemetry />
                            </div>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">Telemetry & graphs</h3>
                        <p className="mt-1 text-sm text-slate-700 max-w-sm">
                            Track clicks and engagement with real‑time charts and insights.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col items-center text-center">
                        <div className="relative w-full border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                            <div className="aspect-[16/12] w-full">
                                <EasySharing />
                            </div>
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">Easy sharing</h3>
                        <p className="mt-1 text-sm text-slate-700 max-w-sm">
                            Share your link anywhere—bio, posts, videos, and more.
                        </p>
                    </div>
                </div>
            </section>

            {/* Testimonials section */}
            <section className="mt-24 pb-24">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Loved by creators worldwide
                    </h2>
                </div>

                <div className="mt-10">
                    <div className="relative w-full border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                        <div className="aspect-[16/9] w-full">
                            <Testimonials />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <Footer />
        </Container>
    )
}
