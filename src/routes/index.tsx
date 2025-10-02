import { createFileRoute } from '@tanstack/react-router'
import Container from '@/components/Container'
import Menu from '@/components/Menu'
import Footer from '@/components/Footer'
import HeroSection1 from '@/components/HeroSection1'
import HeroSection2 from '@/components/HeroSection2'
import Features from '@/components/Features'
import TestimonialsSection from '@/components/TestimonialsSection'
import Hero from '@/components/Hero'

export const Route = createFileRoute('/')({
    head: () => ({
        meta: [
            {
                title: 'Home - LinkHub',
            },
        ],
    }),
    component: RouteComponent,
})

function RouteComponent() {
    const routeContext = Route.useRouteContext();

    return (
        <Container>
            {/* Top navigation */}
            <Menu context={{ user: routeContext.user, userProfile: routeContext.userProfile }} />

            <section className='mt-16 py-12'>
                <div className="relative border-2 border-white/70 bg-white/40 shadow-sm ring-1 ring-white/50 backdrop-blur">
                    <div className="aspect-[16/9] w-full">
                        <Hero />
                    </div>
                </div>
            </section>

            {/* Hero section 1 */}
            <HeroSection1 />

            {/* Hero section 2 */}
            <HeroSection2 />

            {/* Features section */}
            <Features />

            {/* Testimonials section */}
            <TestimonialsSection />

            {/* Footer */}
            <Footer />
        </Container>
    )
}
