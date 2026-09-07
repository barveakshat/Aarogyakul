import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Button, Card } from '../components/ui'
import {
  Shield, Brain, Users, FolderArchive, Activity, Stethoscope,
  FileText, ArrowRight, Check, Zap, Lock, Heart, ChevronRight,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Report Reader',
    description: 'Upload a blood report PDF and our Llama-powered AI extracts every parameter, compares it to your history, and generates a plain-English health summary.',
  },
  {
    icon: FolderArchive,
    title: 'Document Vault',
    description: 'Store prescriptions, bills, insurance documents, medical IDs, and test reports in one organized, searchable vault — no more digging through WhatsApp threads.',
  },
  {
    icon: Activity,
    title: 'Health Timeline',
    description: 'Every doctor visit, vaccination, surgery, and lab test is logged chronologically. Add entries manually or let the AI auto-generate them from uploads.',
  },
  {
    icon: Users,
    title: 'Multi-Profile Profiles',
    description: 'Netflix-style profile picker lets each family member manage their own data independently — all linked to one secure account.',
  },
  {
    icon: Stethoscope,
    title: 'Clinical Notes',
    description: 'Track allergies with severity levels and chronic conditions with diagnosis dates. Everything your doctor needs in one glance.',
  },
  {
    icon: Activity, // Replaced Sparkles with Activity as Sparkles was requested to be removed from some places or just to keep it simple. Actually, we can just use Activity.
    title: 'Trend Insights',
    description: 'See how your HbA1c, cholesterol, or vitamin levels changed over time. Color-coded tables flag what needs attention instantly.',
  },
]

const workflow = [
  {
    step: '1',
    title: 'Upload any medical document',
    text: 'PDFs only, up to 15 MB. Blood reports trigger AI processing; prescriptions, bills, and IDs are stored instantly.',
    icon: FileText,
  },
  {
    step: '2',
    title: 'AI extracts & compares',
    text: 'PDFBox + OCR fallback extracts text. Llama parses structured parameters and compares against your prior values.',
    icon: Brain,
  },
  {
    step: '3',
    title: 'Get actionable insights',
    text: 'Plain-English summaries, trend arrows, and color-coded tables tell you exactly what improved, what worsened, and what needs your doctor\'s attention.',
    icon: Activity,
  },
]

export default function LandingPage() {
  const { user } = useAuth()
  const primaryHref = user ? '/app' : '/register'
  const primaryLabel = user ? 'Open dashboard' : 'Get started free'

  return (
    <div className="min-h-screen bg-bg text-deep overflow-hidden">
      {/* ─── NAV ─── */}
      <header className="sticky top-0 z-50 border-b border-line bg-surf">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="AarogyaKul" className="h-9 w-9 rounded-xl object-contain" />
            <span className="text-lg font-bold tracking-tight text-deep">AarogyaKul</span>
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link className="inline-flex items-center gap-2 bg-focus text-white rounded-md font-semibold px-5 py-2.5 text-sm" to="/app">
                Dashboard <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link className="hidden px-4 py-2.5 text-sm font-semibold text-mid hover:text-focus transition-colors sm:inline-flex" to="/login">
                  Sign in
                </Link>
                <Link className="inline-flex items-center gap-2 bg-focus text-white rounded-md font-semibold px-5 py-2.5 text-sm transition-all" to="/register">
                  Get started <ArrowRight size={15} />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* ─── HERO ─── */}
        <section className="relative">
          <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-28 lg:pb-32">
            <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2">
                  <Zap size={14} className="text-focus" />
                  <span className="text-sm font-medium text-focus">AI-Powered Family Health Management</span>
                </div>

                {/* Headline */}
                <h1 className="font-display text-2xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-deep leading-[1.1]">
                  Your family's health, organized by AI
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-mid">
                  Stop digging through WhatsApp threads and paper folders. AarogyaKul turns scattered medical 
                  PDFs into{' '}
                  <span className="font-semibold text-deep">structured insights</span>,{' '}
                  <span className="font-semibold text-deep">trend comparisons</span>, and a{' '}
                  <span className="font-semibold text-deep">searchable health vault</span> — for every member of your family.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to={primaryHref}>
                    <Button className="w-full px-7 py-3.5 text-base sm:w-auto bg-focus text-white rounded-md font-semibold">{primaryLabel}</Button>
                  </Link>
                  <Link to="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-md border border-line bg-white px-6 py-3.5 text-sm font-semibold text-deep hover:border-focus hover:text-focus transition-all">
                    See how it works <ChevronRight size={16} />
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex flex-wrap items-center gap-5 text-xs font-medium text-mid">
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-ok" /> No credit card needed</span>
                  <span className="flex items-center gap-1.5"><Lock size={14} className="text-ok" /> Data stays on your cloud</span>
                  <span className="flex items-center gap-1.5"><Heart size={14} className="text-ok" /> Built for Indian families</span>
                </div>
              </div>

              {/* Hero Card — AI Report Demo */}
              <HeroPanel />
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="relative py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="text-sm font-medium text-focus">Core Capabilities</span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-deep sm:text-4xl">
                Everything your family's health records need
              </h2>
              <p className="mt-4 text-base leading-7 text-mid">
                From AI-powered report analysis to a comprehensive document vault — six pillars that transform 
                how Indian families manage healthcare.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="p-6">
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-focus/8 text-focus">
                        <feature.icon size={20} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-deep">{feature.title}</h3>
                    <p className="mt-2.5 text-sm leading-6 text-mid">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how-it-works" className="bg-slate-50 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="text-sm font-medium text-focus">How it works</span>
              </div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-deep sm:text-4xl">
                From PDF to health insight in 3 steps
              </h2>
              <p className="mt-4 text-base leading-7 text-mid">
                No setup, no learning curve — just upload and let the AI handle the rest.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {workflow.map((item, i) => (
                <div key={item.step} className="relative">
                  {i < workflow.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-[calc(100%_-_12px)] w-[calc(100%_-_80px)] h-px bg-line z-10" />
                  )}
                  <Card className="relative p-6 h-full">
                    <div className="relative">
                      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-focus/8 text-focus font-bold">
                        {item.step}
                      </div>
                      <h3 className="text-lg font-bold text-deep">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-mid">{item.text}</p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── TECH STACK ─── */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <h2 className="font-display text-2xl font-bold tracking-tight text-deep sm:text-4xl">
                Built with production-grade tech
              </h2>
              <p className="mt-4 text-base leading-7 text-mid">
                A full-stack architecture designed for reliability, security, and AI-first health analysis.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Frontend', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Recharts'] },
                { label: 'Backend', items: ['Spring Boot 3', 'Java 21', 'PostgreSQL', 'JPA/Hibernate'] },
                { label: 'AI / ML', items: ['Llama (HF API)', 'Apache PDFBox', 'Tesseract OCR', 'JSON Parsing'] },
                { label: 'Cloud', items: ['AWS S3', 'Pre-signed URLs', 'BCrypt Auth', 'JWT Security'] },
              ].map((stack) => (
                <Card key={stack.label} className="p-5">
                  <h3 className="text-base font-bold text-deep">{stack.label}</h3>
                  <ul className="mt-3 space-y-2">
                    {stack.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-deep">
                        <Check size={13} className="text-ok shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section className="bg-deep text-white">
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-white">
              Ready to organize your family's health?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/80">
              Create a free health workspace in 30 seconds. Add your family, upload your first report, 
              and let AI do the heavy lifting.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to={primaryHref}>
                <Button className="px-8 py-3.5 text-base bg-focus text-white rounded-md font-semibold">{primaryLabel}</Button>
              </Link>
              <Link to="/login" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-line bg-surf">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="AarogyaKul" className="h-7 w-7 rounded-lg object-contain" />
                <span className="text-sm font-bold text-deep">AarogyaKul</span>
              </div>
              <p className="text-xs text-mid">
                Built with ❤️ for BharatAcademix CodeQuest Hackathon · © {new Date().getFullYear()} AarogyaKul
              </p>
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-focus" />
                <span className="text-xs font-medium text-mid">HIPAA-aligned data practices</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

/* ─── HERO PANEL ─── */
function HeroPanel() {
  return (
    <div className="relative">
      <div className="relative rounded-md border border-line bg-white shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-deep px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">AI Report Reader</div>
                <div className="text-[11px] font-medium text-white/70">Blood panel analyzed in 2.8s</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-ok" />
              <span className="text-[11px] font-bold text-white/80">Completed</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Summary card */}
          <div className="rounded-md border border-line bg-slate-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-[12px] font-bold text-deep">AI Summary</div>
            </div>
            <p className="text-[13px] leading-[1.7] text-mid">
              HbA1c is <span className="font-semibold text-ok">improving (6.4→6.1%)</span>. Vitamin D is 
              <span className="font-semibold text-attn"> critically low at 18 ng/mL</span>. LDL cholesterol is 
              <span className="font-semibold text-alert"> above the preferred range</span>. Recommend follow-up.
            </p>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'HbA1c', value: '6.1%', trend: '↓ 0.3', color: 'text-ok', bg: 'bg-ok/8' },
              { name: 'Vitamin D', value: '18', trend: 'Low', color: 'text-attn', bg: 'bg-attn/8' },
              { name: 'LDL', value: '142', trend: 'High', color: 'text-alert', bg: 'bg-alert/8' },
            ].map((param) => (
              <div key={param.name} className="rounded-md border border-line bg-white p-3.5">
                <div className="text-[11px] font-medium text-mid">{param.name}</div>
                <div className="mt-1.5 text-xl font-bold text-deep">{param.value}</div>
                <div className={`mt-1 inline-flex rounded-sm ${param.bg} px-2 py-0.5 text-[10px] font-semibold ${param.color}`}>
                  {param.trend}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline preview */}
          <div className="flex items-center gap-3 rounded-md bg-slate-50 px-4 py-3">
            <Activity size={14} className="text-focus shrink-0" />
            <span className="text-[12px] text-mid"><span className="font-semibold text-deep">Timeline updated</span> · 3 new events added from this report</span>
          </div>
        </div>
      </div>
    </div>
  )
}
