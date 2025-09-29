import { createFileRoute, Link } from '@tanstack/react-router'
import Container from '@/components/Container'
import Button from '@/components/Button'
import Menu from '@/components/Menu'

export const Route = createFileRoute('/Pricing')({
  component: RouteComponent,
})

const features = {
  free: [
    'Up to 5 custom links',
    'Basic analytics',
    'Standard themes',
    'LinkHub subdomain',
    'Mobile responsive',
    'Basic customization'
  ],
  paid: [
    'Unlimited custom links',
    'Advanced analytics & insights',
    'Premium themes & custom CSS',
    'Custom domain connection',
    'Priority support',
    'Advanced customization',
    'QR code generation',
    'Link scheduling',
    'Bulk link management',
    'API access',
    'Team collaboration',
    'White-label branding'
  ]
}

function RouteComponent() {
  const routeContext = Route.useRouteContext();

  return (
    <Container>
      <Menu context={{ user: routeContext.user, userProfile: routeContext.userProfile }} />
      <div className="py-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Choose the perfect plan for your link-in-bio needs. Start free and upgrade as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-slate-900">$0</span>
                <span className="text-slate-600 ml-2">forever</span>
              </div>
              <p className="text-slate-600">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/Signup" className="block">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-full text-lg font-semibold transition-colors">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-white border-2 border-slate-900 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </span>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro</h3>
              <div className="mb-4">
                <span className="text-5xl font-bold text-slate-900">$9</span>
                <span className="text-slate-600 ml-2">/month</span>
              </div>
              <p className="text-slate-600">Everything you need to grow</p>
            </div>

            <ul className="space-y-4 mb-8">
              {features.paid.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Link to="/Signup" className="block">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-full text-lg font-semibold transition-colors">
                Start 7-Day Free Trial
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Can I change plans anytime?
              </h3>
              <p className="text-slate-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                What happens to my data if I cancel?
              </h3>
              <p className="text-slate-600">
                Your data remains safe for 30 days after cancellation. You can reactivate anytime during this period to restore full access.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Do you offer custom enterprise plans?
              </h3>
              <p className="text-slate-600">
                Yes! We offer custom enterprise solutions for teams and organizations with specific needs. Contact us to discuss your requirements.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Is there a setup fee?
              </h3>
              <p className="text-slate-600">
                No setup fees ever! Start with our free plan immediately or begin your Pro trial without any upfront costs.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-slate-50 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Join thousands of creators, entrepreneurs, and businesses who trust LinkHub for their link-in-bio needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Link to="/Signup" className="flex-1">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-full text-lg font-semibold transition-colors">
                  Start Free Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
