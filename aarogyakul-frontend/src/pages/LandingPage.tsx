import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Button, Card } from '../components/ui'
import {
  Shield, Brain, Users, FolderArchive, Activity, Stethoscope,
  FileText, Sparkles, ArrowRight, Check, Zap, Lock, Heart, ChevronRight,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Report Reader',
    description: 'Upload a blood report PDF and our Llama-powered AI extracts every parameter, compares it to your history, and generates a plain-English health summary.',
    gradient: 'from-pri to-sec',
    tag: 'Flagship',
  },
  {
    icon: FolderArchive,
    title: 'Document Vault',
    description: 'Store prescriptions, bills, insurance documents, medical IDs, and test reports in one organized, searchable vault — no more digging through WhatsApp threads.',
    gradient: 'from-aqua to-pri',
    tag: 'Organized',
  },
  {
    icon: Activity,
    title: 'Health Timeline',
    description: 'Every doctor visit, vaccination, surgery, and lab test is logged chronologically. Add entries manually or let the AI auto-generate them from uploads.',
    gradient: 'from-sec to-pink-500',
    tag: 'Chronological',
  },
  {
    icon: Users,
    title: 'Multi-Profile Profiles',
    description: 'Netflix-style profile picker lets each family member manage their own data independently — all linked to one secure account.',
    gradient: 'from-emerald-500 to-aqua',
    tag: 'Family-first',
  },
  {
    icon: Stethoscope,
    title: 'Clinical Notes',
    description: 'Track allergies with severity levels and chronic conditions with diagnosis dates. Everything your doctor needs in one glance.',
    gradient: 'from-amber-500 to-orange-500',
    tag: 'Clinical',
  },
  {
    icon: Sparkles,
    title: 'Trend Insights',
    description: 'See how your HbA1c, cholesterol, or vitamin levels changed over time. Color-coded tables flag what needs attention instantly.',
    gradient: 'from-pri to-aqua',
    tag: 'Predictive',
  },
]

const stats = [
  { value: '6+', label: 'Document types supported' },
  { value: '<3s', label: 'AI extraction time' },
  { value: '100%', label: 'Offline-first vault' },
  { value: '∞', label: 'Family members' },
]

const workflow = [
  {
    step: '01',
    title: 'Upload any medical document',
    text: 'PDFs only, up to 15 MB. Blood reports trigger AI processing; prescriptions, bills, and IDs are stored instantly.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'AI extracts & compares',
    text: 'PDFBox + OCR fallback extracts text. Llama parses structured parameters and compares against your prior values.',
    icon: Brain,
  },
  {
    step: '03',
    title: 'Get actionable insights',
    text: 'Plain-English summaries, trend arrows, and color-coded tables tell you exactly what improved, what worsened, and what needs your doctor\'s attention.',
    icon: Sparkles,
  },
]

export default function LandingPage() {
  const { user } = useAuth()
  const primaryHref = user ? '/app' : '/register'
  const primaryLabel = user ? 'Open dashboard' : 'Get started free'

  return (
    <div className="min-h-screen bg-bg text-txtP overflow-hidden">
      {/* ─── NAV ─── */}
      <header className="sticky top-0 z-50 border-b border-brd/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="AarogyaKul" className="h-9 w-9 rounded-xl object-contain" />
            <span className="text-lg font-black tracking-tight text-txtP">AarogyaKul</span>
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <Link className="inline-flex items-center gap-2 rounded-btn bg-gradient-to-r from-pri to-sec px-5 py-2.5 text-sm font-bold text-white shadow-glow" to="/app">
                Dashboard <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link className="hidden rounded-btn px-4 py-2.5 text-sm font-bold text-txtS hover:text-pri transition-colors sm:inline-flex" to="/login">
                  Sign in
                </Link>
                <Link className="inline-flex items-center gap-2 rounded-btn bg-gradient-to-r from-pri to-sec px-5 py-2.5 text-sm font-bold text-white shadow-glow transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]" to="/register">
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
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-pri/8 via-sec/5 to-transparent blur-3xl" />
            <div className="absolute top-60 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-aqua/8 via-pri/5 to-transparent blur-3xl" />
            <div className="absolute top-20 left-1/2 -translate-x-1/2 h-px w-[800px] bg-gradient-to-r from-transparent via-pri/20 to-transparent" />
          </div>

          <div className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-28 lg:pb-32">
            <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative">
                {/* Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pri/20 bg-pri/[0.04] px-4 py-2">
                  <Zap size={14} className="text-pri" />
                  <span className="text-xs font-bold tracking-wide text-pri">AI-Powered Family Health Management</span>
                </div>

                {/* Headline */}
                <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-txtP sm:text-5xl lg:text-[3.5rem]">
                  Your family's health,{' '}
                  <span className="bg-gradient-to-r from-pri via-sec to-aqua bg-clip-text text-transparent">
                    organized by AI
                  </span>
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-txtS">
                  Stop digging through WhatsApp threads and paper folders. AarogyaKul turns scattered medical 
                  PDFs into{' '}
                  <span className="font-semibold text-txtP">structured insights</span>,{' '}
                  <span className="font-semibold text-txtP">trend comparisons</span>, and a{' '}
                  <span className="font-semibold text-txtP">searchable health vault</span> — for every member of your family.
                </p>

                {/* CTA Buttons */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to={primaryHref}>
                    <Button className="w-full px-7 py-3.5 text-base sm:w-auto">{primaryLabel}</Button>
                  </Link>
                  <Link to="#how-it-works" className="inline-flex items-center justify-center gap-2 rounded-btn border border-brd bg-white px-6 py-3.5 text-sm font-bold text-txtP hover:border-pri/40 hover:text-pri transition-all">
                    See how it works <ChevronRight size={16} />
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-8 flex flex-wrap items-center gap-5 text-xs font-medium text-txtS">
                  <span className="flex items-center gap-1.5"><Check size={14} className="text-norm" /> No credit card needed</span>
                  <span className="flex items-center gap-1.5"><Lock size={14} className="text-norm" /> Data stays on your cloud</span>
                  <span className="flex items-center gap-1.5"><Heart size={14} className="text-norm" /> Built for Indian families</span>
                </div>
              </div>

              {/* Hero Card — AI Report Demo */}
              <HeroPanel />
            </div>
          </div>
        </section>

        {/* ─── STATS BAR ─── */}
        <section className="border-y border-brd bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-pri to-sec bg-clip-text text-transparent">{stat.value}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.15em] text-txtS">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="relative py-20 lg:py-28">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-sec/5 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pri/20 bg-pri/[0.04] px-4 py-1.5">
                <Sparkles size={14} className="text-pri" />
                <span className="text-xs font-bold tracking-wide text-pri">Core Capabilities</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-txtP sm:text-4xl">
                Everything your family's health records need
              </h2>
              <p className="mt-4 text-base leading-7 text-txtS">
                From AI-powered report analysis to a comprehensive document vault — six pillars that transform 
                how Indian families manage healthcare.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="group relative p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/80 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-5">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-md`}>
                        <feature.icon size={20} />
                      </div>
                      <span className="rounded-full bg-pri/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-pri">{feature.tag}</span>
                    </div>
                    <h3 className="text-lg font-black text-txtP">{feature.title}</h3>
                    <p className="mt-2.5 text-sm leading-6 text-txtS">{feature.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section id="how-it-works" className="bg-gradient-to-b from-slate-50 to-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-14">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sec/20 bg-sec/[0.04] px-4 py-1.5">
                <Zap size={14} className="text-sec" />
                <span className="text-xs font-bold tracking-wide text-sec">How it works</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-txtP sm:text-4xl">
                From PDF to health insight in 3 steps
              </h2>
              <p className="mt-4 text-base leading-7 text-txtS">
                No setup, no learning curve — just upload and let the AI handle the rest.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {workflow.map((item, i) => (
                <div key={item.step} className="relative">
                  {i < workflow.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-[calc(100%_-_12px)] w-[calc(100%_-_80px)] h-px bg-gradient-to-r from-pri/30 to-transparent z-10" />
                  )}
                  <Card className="relative p-6 h-full overflow-hidden">
                    <div className="absolute top-0 right-0 text-[120px] font-black leading-none text-pri/[0.04] -translate-y-4 translate-x-2 select-none pointer-events-none">
                      {item.step}
                    </div>
                    <div className="relative">
                      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pri to-sec text-white shadow-lg">
                        <item.icon size={24} />
                      </div>
                      <h3 className="text-lg font-black text-txtP">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-txtS">{item.text}</p>
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
              <h2 className="text-3xl font-black tracking-tight text-txtP sm:text-4xl">
                Built with production-grade tech
              </h2>
              <p className="mt-4 text-base leading-7 text-txtS">
                A full-stack architecture designed for reliability, security, and AI-first health analysis.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Frontend', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'Recharts'], color: 'from-aqua to-pri' },
                { label: 'Backend', items: ['Spring Boot 3', 'Java 21', 'PostgreSQL', 'JPA/Hibernate'], color: 'from-pri to-sec' },
                { label: 'AI / ML', items: ['Llama (HF API)', 'Apache PDFBox', 'Tesseract OCR', 'JSON Parsing'], color: 'from-sec to-pink-500' },
                { label: 'Cloud', items: ['AWS S3', 'Pre-signed URLs', 'BCrypt Auth', 'JWT Security'], color: 'from-emerald-500 to-aqua' },
              ].map((stack) => (
                <Card key={stack.label} className="p-5">
                  <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${stack.color}`} />
                  <h3 className="text-sm font-black uppercase tracking-[0.12em] text-txtS">{stack.label}</h3>
                  <ul className="mt-3 space-y-2">
                    {stack.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-txtP">
                        <Check size={13} className="text-norm shrink-0" />
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
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-sbBg via-[#111827] to-sbBg" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-pri/10 blur-[100px]" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to organize your{' '}
              <span className="bg-gradient-to-r from-pri via-aqua to-sec bg-clip-text text-transparent">
                family's health?
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-400">
              Create a free health workspace in 30 seconds. Add your family, upload your first report, 
              and let AI do the heavy lifting.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to={primaryHref}>
                <Button className="px-8 py-3.5 text-base">{primaryLabel}</Button>
              </Link>
              <Link to="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
                Already have an account? Sign in →
              </Link>
            </div>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="border-t border-brd bg-white">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="AarogyaKul" className="h-7 w-7 rounded-lg object-contain" />
                <span className="text-sm font-black text-txtP">AarogyaKul</span>
              </div>
              <p className="text-xs text-txtS">
                Built with ❤️ for BharatAcademix CodeQuest Hackathon · © {new Date().getFullYear()} AarogyaKul
              </p>
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-norm" />
                <span className="text-xs font-medium text-txtS">HIPAA-aligned data practices</span>
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
      {/* Glow effect */}
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-pri/20 via-aqua/10 to-sec/20 blur-2xl animate-pulse" style={{ animationDuration: '4s' }} />

      <div className="relative rounded-2xl border border-brd/60 bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pri via-sec to-aqua px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-black text-white">AI Report Reader</div>
                <div className="text-[11px] font-medium text-white/70">Blood panel analyzed in 2.8s</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white/80">Completed</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Summary card */}
          <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={13} className="text-pri" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-pri">AI Summary</div>
            </div>
            <p className="text-[13px] leading-[1.7] text-txtS">
              HbA1c is <span className="font-semibold text-norm">improving (6.4→6.1%)</span>. Vitamin D is 
              <span className="font-semibold text-warn"> critically low at 18 ng/mL</span>. LDL cholesterol is 
              <span className="font-semibold text-crit"> above the preferred range</span>. Recommend follow-up.
            </p>
          </div>

          {/* Parameters */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'HbA1c', value: '6.1%', trend: '↓ 0.3', color: 'text-norm', bg: 'bg-norm/8' },
              { name: 'Vitamin D', value: '18', trend: 'Low', color: 'text-warn', bg: 'bg-warn/8' },
              { name: 'LDL', value: '142', trend: 'High', color: 'text-crit', bg: 'bg-crit/8' },
            ].map((param) => (
              <div key={param.name} className="rounded-xl border border-brd/70 bg-white p-3.5">
                <div className="text-[11px] font-bold text-txtS">{param.name}</div>
                <div className="mt-1.5 text-xl font-black text-txtP">{param.value}</div>
                <div className={`mt-1 inline-flex rounded-full ${param.bg} px-2 py-0.5 text-[10px] font-bold ${param.color}`}>
                  {param.trend}
                </div>
              </div>
            ))}
          </div>

          {/* Timeline preview */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <Activity size={14} className="text-pri shrink-0" />
            <span className="text-[12px] text-txtS"><span className="font-bold text-txtP">Timeline updated</span> · 3 new events added from this report</span>
          </div>
        </div>
      </div>
    </div>
  )
}
