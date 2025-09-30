import { createFileRoute } from '@tanstack/react-router'
import Container from '@/components/Container'
import Menu from '@/components/Menu'
import Footer from '@/components/Footer'
import HeroSection1 from '@/components/HeroSection1'
import HeroSection2 from '@/components/HeroSection2'
import Features from '@/components/Features'
// import TestimonialsSection from '@/components/TestimonialsSection'

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
    const routeContext = Route.useRouteContext();

    return (
        <Container>
            {/* Top navigation */}
            <Menu context={{ user: routeContext.user, userProfile: routeContext.userProfile }} />

            {/* Hero section 1 */}
            <HeroSection1 />

            {/* Hero section 2 */}
            <HeroSection2 />

            {/* Features section */}
            <Features />

            {/* Testimonials section */}
            {/* <TestimonialsSection /> */}

            {/* Footer */}
            <Footer />
        </Container>
    )
}
