import { Link } from "@tanstack/react-router";
import { Share } from "./Share";

function HeroSection2() {
    return (
        <section className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center py-12">
            {/* Left: copy + CTA */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Share everything with a single link
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-700">
                    Create your profile in minutes and let your audience find all your content in one place.
                </p>

                <div className="mt-6">
                    <Link
                        to="/auth/signup"
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-base font-semibold text-white shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                    >
                        Start for free
                    </Link>
                </div>
            </div>

            {/* Right: Rive placeholder */}
            <div className="relative border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                <div className="aspect-[16/12] w-full">
                    <Share />
                </div>
            </div>
        </section>
    )
}

export default HeroSection2;
