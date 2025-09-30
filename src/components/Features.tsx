import AllLinks from "./AllLinks";
import { EasySharing } from "./EasySharing";
import { Telemetry } from "./Telemetry";

function Features() {
    return (
        <section className="mt-20 pb-20">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Features
                </h2>
                <p className="mt-2 text-base text-slate-700">
                    Everything you need to share your world with one link.
                </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                {/* Feature 1 */}
                <div className="flex flex-col items-center text-center">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">All your links</h3>
                    <p className="mb-4 text-sm text-slate-700 max-w-sm">
                        Collect links to content, products, and profiles in one place.
                    </p>
                    <div className="relative w-full border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                        <div className="aspect-[16/12] w-full">
                            <AllLinks />
                        </div>
                    </div>
                </div>

                {/* Feature 2 */}
                <div className="flex flex-col items-center text-center">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">Telemetry & graphs</h3>
                    <p className="mb-4 text-sm text-slate-700 max-w-sm">
                        Track clicks and engagement with real‑time charts and insights.
                    </p>
                    <div className="relative w-full border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                        <div className="aspect-[16/12] w-full">
                            <Telemetry />
                        </div>
                    </div>
                </div>

                {/* Feature 3 */}
                <div className="flex flex-col items-center text-center">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900">Easy sharing</h3>
                    <p className="mb-4 text-sm text-slate-700 max-w-sm">
                        Share your link anywhere—bio, posts, videos, and more.
                    </p>
                    <div className="relative w-full border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                        <div className="aspect-[16/12] w-full">
                            <EasySharing />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Features;
