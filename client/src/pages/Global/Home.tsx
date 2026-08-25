// src/pages/Home.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  ArrowUpRight,
  Zap,
  CreditCard,
  BarChart3,
  Mail,
  Wallet,
  Brain,
  Database,
} from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Zap,
      title: 'Instant access',
      description: 'API keys issue the moment you subscribe — no approval queue, no waiting on emails.',
    },
    {
      icon: CreditCard,
      title: 'Flexible plans',
      description: 'Move between free, pay-as-you-go, and enterprise tiers as usage changes, per API.',
    },
    {
      icon: BarChart3,
      title: 'Usage analytics',
      description: 'Watch quota burn, latency, and spend per key from one dashboard, updated live.',
    },
  ];

  const categories = [
    { icon: Mail, label: 'Email services', count: 12 },
    { icon: Wallet, label: 'Payment processing', count: 8 },
    { icon: Brain, label: 'AI & ML', count: 15 },
    { icon: Database, label: 'Cloud storage', count: 6 },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CTO, TechFlow',
      content:
        'We moved four vendor contracts into one dashboard. Billing reconciliation alone paid for the switch.',
    },
    {
      name: 'Michael Chen',
      role: 'Lead Developer, DataBridge',
      content:
        'Quota alerts caught a runaway job before it became a five-figure invoice. That\u2019s the whole pitch for me.',
    },
  ];

  return (
    <div className="bg-[#F4F5F2] font-sans text-[#14161F]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', ui-sans-serif, system-ui, sans-serif; }
        .font-sans { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        @keyframes blink { 0%, 45% { opacity: 1; } 50%, 95% { opacity: 0; } 100% { opacity: 1; } }
        .cursor-blink { animation: blink 1.1s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .cursor-blink { animation: none; opacity: 1; }
        }
      `}</style>

      {/* ============ HERO ============ */}
      <section className="border-b border-[#E2E4E0]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-12 items-center">
            {/* Left: copy */}
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wide text-[#5B6270] uppercase">
                <span className="w-1.5 h-1.5 bg-[#0E9594] rounded-full" />
                5,000+ teams building on Nymbl
              </div>

              <h1 className="font-display mt-6 text-[2.75rem] leading-[1.05] sm:text-6xl lg:text-[3.6rem] font-semibold tracking-tight text-[#14161F]">
                Subscribe once.
                <br />
                Call <span className="text-[#0E9594]">anything.</span>
              </h1>

              <p className="mt-6 text-lg text-[#464C58] max-w-lg leading-relaxed">
                Email, payments, AI, storage — browse the catalog, subscribe per API,
                and manage every key, quota, and invoice from one dashboard.
              </p>

              {!isAuthenticated ? (
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <Link
                    to="/auth"
                    state={{ mode: 'login' }}
                    className="group inline-flex items-center gap-2 bg-[#14161F] text-white px-6 py-3 text-sm font-medium rounded-md hover:bg-[#272A36] transition-colors"
                  >
                    Get started
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/packages"
                    className="inline-flex items-center gap-2 text-[#14161F] px-6 py-3 text-sm font-medium rounded-md border border-[#D7D9D3] hover:border-[#14161F] transition-colors"
                  >
                    Browse APIs
                  </Link>
                </div>
              ) : (
                <div className="mt-9">
                  <p className="text-[#464C58]">
                    Welcome back, <span className="font-semibold text-[#14161F]">{user?.name}</span>
                  </p>
                  <Link
                    to="/subscriptions"
                    className="mt-5 group inline-flex items-center gap-2 bg-[#14161F] text-white px-6 py-3 text-sm font-medium rounded-md hover:bg-[#272A36] transition-colors"
                  >
                    View your subscription
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </div>

            {/* Right: live console panel (signature element) */}
            <div className="relative">
              <div className="rounded-lg bg-[#14161F] overflow-hidden shadow-[0_20px_50px_-15px_rgba(20,22,31,0.35)]">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E86B5C]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F0A202]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0E9594]" />
                  <span className="ml-3 font-mono text-[11px] text-white/40">GET /v1/subscriptions/active</span>
                </div>
                <div className="px-5 py-6 font-mono text-[13px] leading-6">
                  <p className="text-white/50">$ curl https://api.store/v1/subscriptions/active \</p>
                  <p className="text-white/50 pl-4">-H "Authorization: Bearer sk_live_••••"</p>
                  <p className="mt-4 text-white/30">200 OK</p>
                  <pre className="mt-1 whitespace-pre-wrap">
                    <span className="text-white/70">{'{'}</span>{'\n'}
                    <span className="text-[#F0A202]">{'  "plan"'}</span>
                    <span className="text-white/50">: </span>
                    <span className="text-[#8FE3C8]">{'"pro"'}</span>
                    <span className="text-white/50">,{'\n'}</span>
                    <span className="text-[#F0A202]">{'  "apis"'}</span>
                    <span className="text-white/50">: [</span>
                    <span className="text-[#8FE3C8]">{'"email"'}</span>
                    <span className="text-white/50">, </span>
                    <span className="text-[#8FE3C8]">{'"payments"'}</span>
                    <span className="text-white/50">],{'\n'}</span>
                    <span className="text-[#F0A202]">{'  "quota_remaining"'}</span>
                    <span className="text-white/50">: </span>
                    <span className="text-[#8FE3C8]">{'"94%"'}</span>
                    <span className="text-white/50">{'\n}'}</span>
                    <span className="cursor-blink text-white/50">▌</span>
                  </pre>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 w-full h-full rounded-lg border border-[#D7D9D3] -z-10 hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Trust bar */}
        <div className="border-t border-[#E2E4E0]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <span className="font-mono text-[11px] uppercase tracking-wide text-[#8B909C]">
              Engineering teams at
            </span>
            {['Google', 'Microsoft', 'Amazon', 'Netflix', 'Spotify'].map((company, i) => (
              <span key={company} className="font-display text-sm font-semibold text-[#3A3F4B]">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="max-w-xl mb-14">
          <span className="font-mono text-xs uppercase tracking-wide text-[#0E9594]">Platform</span>
          <h2 className="font-display mt-3 text-3xl font-semibold text-[#14161F]">
            Everything between you and a working integration
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E2E4E0] border-t border-[#E2E4E0]">
          {features.map((feature, index) => (
            <div key={index} className="py-8 md:py-2 md:px-8 first:pl-0">
              <feature.icon className="w-5 h-5 text-[#0E9594] mt-8 mb-4" strokeWidth={1.75} />
              <h3 className="font-display text-lg font-semibold text-[#14161F] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#5B6270] leading-relaxed text-[15px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      <section className="border-y border-[#E2E4E0] bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="font-mono text-xs uppercase tracking-wide text-[#0E9594]">Catalog</span>
              <h2 className="font-display mt-3 text-3xl font-semibold text-[#14161F]">
                Popular categories
              </h2>
            </div>
            <Link
              to="/packages"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[#14161F] hover:text-[#0E9594] transition-colors"
            >
              View full catalog
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="border-t border-[#E2E4E0]">
            {categories.map((category, index) => (
              <Link
                to="/packages"
                key={index}
                className="group flex items-center justify-between py-5 border-b border-[#E2E4E0] hover:bg-[#F7F8F5] transition-colors px-2 -mx-2"
              >
                <div className="flex items-center gap-4">
                  <category.icon className="w-[18px] h-[18px] text-[#5B6270] group-hover:text-[#0E9594] transition-colors" strokeWidth={1.75} />
                  <span className="font-medium text-[#14161F]">{category.label}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-mono text-sm tabular-nums text-[#8B909C]">{category.count} APIs</span>
                  <ArrowRight className="w-4 h-4 text-[#8B909C] group-hover:text-[#14161F] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="max-w-xl mb-14">
          <span className="font-mono text-xs uppercase tracking-wide text-[#0E9594]">Word from the field</span>
          <h2 className="font-display mt-3 text-3xl font-semibold text-[#14161F]">
            Loved by developers, trusted by finance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
          {testimonials.map((testimonial, index) => (
            <blockquote
              key={index}
              className="border-l-2 border-[#F0A202] pl-6"
            >
              <p className="text-[#14161F] text-xl leading-relaxed font-display font-medium">
                “{testimonial.content}”
              </p>
              <footer className="mt-5 font-mono text-sm text-[#5B6270]">
                {testimonial.name} — {testimonial.role}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="bg-[#14161F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
          <div className="max-w-2xl">
            <span className="font-mono text-xs uppercase tracking-wide text-[#F0A202]">Get started</span>
            <h2 className="font-display mt-3 text-3xl lg:text-4xl font-semibold text-white">
              Ready to build something amazing?
            </h2>
            <p className="mt-4 text-[#A9AEB9] text-lg leading-relaxed">
              Join thousands of developers running production traffic through Nymbl keys.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              {!isAuthenticated ? (
                <Link
                  to="/auth"
                  state={{ mode: 'signup' }}
                  className="inline-flex items-center gap-2 bg-[#F0A202] text-[#14161F] px-6 py-3 text-sm font-semibold rounded-md hover:bg-[#FFB528] transition-colors"
                >
                  Start free trial
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 bg-[#F0A202] text-[#14161F] px-6 py-3 text-sm font-semibold rounded-md hover:bg-[#FFB528] transition-colors"
                >
                  Go to dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                to="/packages"
                className="inline-flex items-center gap-2 text-white px-6 py-3 text-sm font-medium rounded-md border border-white/20 hover:border-white/40 transition-colors"
              >
                Browse plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;