import { useRef } from "react";
import Testimonials from "./Testimonials";
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP)


function TestimonialsSection() {
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
        <section className="mt-24 pb-24">
            <div className="text-center" ref={fadeInRef}>
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
