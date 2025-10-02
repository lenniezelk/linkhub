import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import Connect from "./Connect";
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react';


gsap.registerPlugin(ScrollTrigger, useGSAP)

function HeroSection1() {
    const [handle, setHandle] = useState('')
    const fadeInRef = useRef<HTMLDivElement | null>(null);

    useGSAP(() => {
        gsap.fromTo(fadeInRef.current, {
            opacity: 0,
            y: 30
        }, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: fadeInRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    }, { scope: fadeInRef });

    return (
        <section className="mt-16 py-12 grid grid-cols-1 content-center gap-8 md:grid-cols-2 md:items-center">
            {/* Left: copy + input */}
            <div>
                <div ref={fadeInRef} className="opacity-0">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        The only link you'll ever need.
                    </h1>
                    <p className="mt-3 text-base leading-7 text-slate-700">
                        Connect your audience to all your content with one simple link. Perfect for your
                        social media bio.
                    </p>
                </div>

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
                            to={`/auth/signup`}
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
    )
}

export default HeroSection1;