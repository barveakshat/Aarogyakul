import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Button, Card } from '../components/ui'
import { BrandMark } from '../components/BrandMark'

const workflow = [
  { step: '01', title: 'Upload health PDFs', text: 'Guarded PDF-only uploads keep medical reports organized per family member.' },
  { step: '02', title: 'Extract parameters', text: 'PDFBox, OCR fallback, and Llama JSON parsing convert reports into structured values.' },
  { step: '03', title: 'Compare trends', text: 'AarogyaKul compares prior values and turns changes into plain-English insights.' },
]

const features = ['Family dashboard', 'Member profiles', 'AI report reader', 'Health timeline', 'Clinical notes', 'PDF processing queue']

export default function LandingPage() {
  const { user } = useAuth()
  const primaryHref = user ? '/app' : '/register'
  const primaryLabel = user ? 'Open dashboard' : 'Create health workspace'

  return (
    <div className="min-h-screen bg-bg text-txtP">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <BrandMark />
          <nav className="flex items-center gap-2">
            {user ? (
              <Link className="rounded-btn border border-brd bg-white px-4 py-2 text-sm font-bold text-pri hover:border-pri" to="/app">
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="hidden rounded-btn px-4 py-2 text-sm font-bold text-txtS hover:bg-white hover:text-pri sm:inline-flex" to="/login">
                  Sign in
                </Link>
                <Link className="rounded-btn bg-gradient-to-r from-pri to-pri2 px-4 py-2 text-sm font-bold text-white shadow-glow" to="/register">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-pri2/20 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
            <div className="relative">
              <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-pri">
                AI family health intelligence
              </div>
              <h1 className="max-w-4xl text-5xl font-black tracking-tight text-txtP sm:text-6xl">
                A calmer way to understand every family health report.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-txtS">
                AarogyaKul turns scattered PDF reports into member profiles, extracted medical parameters, trend comparisons, and timelines that families can actually follow.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={primaryHref}><Button className="w-full px-6 py-3 sm:w-auto">{primaryLabel}</Button></Link>
                <Link to="/login"><Button className="w-full px-6 py-3 sm:w-auto" variant="secondary">Sign in</Button></Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {features.map((feature) => (
                  <span key={feature} className="rounded-full border border-white/80 bg-white/70 px-3 py-1.5 text-xs font-bold text-txtS shadow-crd">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <HeroPanel />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((item) => (
              <Card key={item.step} className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-mint to-emerald-100 text-sm font-black text-pri">{item.step}</div>
                <h2 className="text-lg font-black text-txtP">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-txtS">{item.text}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function HeroPanel() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-pri/15 via-aqua/10 to-pri2/20 blur-2xl" />
      <Card className="relative overflow-hidden">
        <div className="bg-gradient-to-r from-pri to-pri2 px-6 py-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-black">AI Report Reader</div>
              <div className="mt-1 text-xs font-medium text-white/75">Blood report completed</div>
            </div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">Secure workspace</span>
          </div>
        </div>
        <div className="p-6">
          <div className="rounded-crd border border-emerald-100 bg-gradient-to-br from-mint/70 to-white p-5">
            <div className="text-xs font-black uppercase tracking-[0.18em] text-pri">Plain-English summary</div>
            <p className="mt-3 text-sm leading-6 text-txtS">
              HbA1c is improving, Vitamin D needs attention, and LDL is above the preferred range. Consider routine follow-up with your clinician.
            </p>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              ['HbA1c', '6.1%', 'Improving'],
              ['Vit D', '18', 'Low'],
              ['LDL', '142', 'High'],
            ].map(([name, value, state]) => (
              <div key={name} className="rounded-2xl border border-brd bg-white/80 p-4">
                <div className="text-xs font-bold text-txtS">{name}</div>
                <div className="mt-2 text-2xl font-black text-txtP">{value}</div>
                <div className="mt-1 text-xs font-bold text-pri">{state}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
