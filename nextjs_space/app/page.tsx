import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  BarChart3,
  AlertCircle,
  Check,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "AI-Powered Forecasting",
    description: "Predict cash shortfalls up to 90 days in advance",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Visualize trends and category breakdowns at a glance",
  },
  {
    icon: AlertCircle,
    title: "Real-Time Alerts",
    description: "Get notified of upcoming transactions before they happen",
  },
];

const pricingTiers = [
  {
    name: "Solo",
    price: 19,
    description: "Perfect for freelancers",
    features: [
      "Up to 1,000 transactions",
      "30-day cash flow forecast",
      "Basic analytics",
      "Mobile app access",
    ],
  },
  {
    name: "Pro",
    price: 59,
    description: "For growing businesses",
    features: [
      "Unlimited transactions",
      "90-day AI forecast",
      "Advanced analytics",
      "Plaid bank integration",
      "API access",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Team",
    price: 149,
    description: "For enterprise needs",
    features: [
      "All Pro features",
      "Up to 5 team members",
      "Custom forecasting models",
      "Dedicated account manager",
      "SSO & advanced security",
      "24/7 priority support",
    ],
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    company: "Tech Startup",
    text: "CashFlowIQ helped us avoid a cash crisis. The 90-day forecast gave us exactly the visibility we needed.",
  },
  {
    name: "Marcus Johnson",
    company: "Freelance Designer",
    text: "Finally, I can predict my income and expenses. No more sleepless nights about cash flow.",
  },
  {
    name: "Elena Rodriguez",
    company: "Small Retail",
    text: "The category breakdown feature is game-changing. I can see exactly where my money goes.",
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">CashFlowIQ</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6 text-gray-900">
            Predict Your Cash Flow.<br />
            Avoid Cash Crises.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered forecasting for small businesses. Know your cash position
            90 days in advance and make confident financial decisions.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Try Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-20 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Teams Love CashFlowIQ</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
                  <Icon className="w-10 h-10 text-blue-600 mb-4" />
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-600 mb-12">Choose the plan that fits your business</p>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => (
              <div
                key={i}
                className={`rounded-lg border p-8 transition ${
                  tier.popular
                    ? "border-blue-600 bg-blue-50 shadow-lg"
                    : "border-gray-200 bg-white"
                }`}
              >
                {tier.popular && (
                  <div className="text-sm font-semibold text-blue-600 mb-4">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <Link href="/signup" className="w-full block">
                  <Button
                    className="w-full mb-8"
                    variant={tier.popular ? "default" : "outline"}
                  >
                    Get Started
                  </Button>
                </Link>
                <ul className="space-y-3">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Loved by Business Owners</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-lg border border-gray-200">
                <p className="text-gray-600 mb-6 italic">\"{testimonial.text}\"</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Master Your Cash Flow?</h2>
          <p className="text-lg mb-8 opacity-90">Join hundreds of SMBs using CashFlowIQ</p>
          <Link href="/signup">
            <Button size="lg" variant="secondary">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 CashFlowIQ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
