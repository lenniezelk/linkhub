import Testimonials from "./Testimonials";

function TestimonialsSection() {
    return (
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
    )
}

export default TestimonialsSection;
