import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Button, Card } from '../components/ui'

const workflow = [
  { step: '1', title: 'Upload PDF reports', text: 'Blood reports and clinical documents enter a guarded, PDF-only flow with clear processing status.' },
  { step: '2', title: 'Extract medical parameters', text: 'The AI Report Reader parses values, units, reference ranges, and report dates into structured records.' },
  { step: '3', title: 'Track family trends', text: 'Each member gets timelines, prior comparisons, and plain-English summaries for faster review.' },
]

const highlights = [
  { label: '15MB', text: 'PDF upload cap' },
  { label: 'JWT', text: 'Protected family workspace' },
  { label: 'S3', text: 'Short-lived file access model' },
]

export default function LandingPage() {
  const { user } = useAuth()
  const primaryHref = user ? '/app' : '/register'
  const primaryLabel = user ? 'Open dashboard' : 'Create free workspace'

  return (
    <div className="min-h-screen bg-bg text-txtP">
      <header className="sticky top-0 z-20 border-b border-brd bg-surf/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-crd border border-brd bg-white text-sm font-semibold text-pri shadow-crd">AK</span>
            <span>
              <span className="block text-base font-semibold leading-5">AarogyaKul</span>
              <span className="block text-xs font-medium uppercase tracking-wide text-txtS">Family health intelligence</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            {user ? (
              <Link className="rounded-btn border border-brd px-4 py-2 text-sm font-medium text-txtP transition-colors duration-200 hover:border-pri hover:text-pri" to="/app">
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="hidden rounded-btn px-4 py-2 text-sm font-medium text-txtS transition-colors duration-200 hover:bg-slate-100 hover:text-txtP sm:inline-flex" to="/login">
                  Sign in
                </Link>
                <Link className="rounded-btn bg-pri px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700" to="/register">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-brd bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-pri">
                AI Report Reader for Indian families
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-txtP sm:text-5xl">
                Turn scattered medical PDFs into a clear family health timeline.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-txtS">
                AarogyaKul organizes family members, uploads reports safely, extracts medical parameters, and summarizes what changed since the last report.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={primaryHref}>
                  <Button className="w-full sm:w-auto">{primaryLabel}</Button>
                </Link>
                <Link to="/login">
                  <Button className="w-full sm:w-auto" variant="secondary">Sign in</Button>
                </Link>
              </div>
              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-crd border border-brd bg-bg p-4">
                    <div className="text-lg font-semibold tabular-nums text-txtP">{item.label}</div>
                    <div className="mt-1 text-xs leading-5 text-txtS">{item.text}</div>
                  </div>
                ))}
              </div>
            </div>

            <HeroPanel />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-semibold text-txtP">Built around the report workflow</h2>
            <p className="mt-2 text-sm leading-6 text-txtS">
              The product focuses on the MVP boundary: family members, document upload, AI extraction, comparison, summaries, and timeline events.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((item) => (
              <Card key={item.step} className="p-5">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-pri">{item.step}</div>
                <h3 className="text-base font-semibold text-txtP">{item.title}</h3>
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
      <Card className="overflow-hidden">
        <div className="border-b border-brd bg-bg px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-txtP">AI Report Reader</div>
              <div className="mt-1 text-xs text-txtS">Blood report · Processing completed</div>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Completed</span>
          </div>
        </div>
        <div className="p-5">
          <div className="rounded-crd border border-blue-100 bg-blue-50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-pri">Plain-English summary</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              HbA1c improved from the previous report, Vitamin D remains below range, and cholesterol needs routine follow-up.
            </p>
          </div>
          <div className="mt-5 overflow-hidden rounded-crd border border-brd">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-xs uppercase tracking-wide text-txtS">
                <tr>
                  <th className="px-4 py-3 font-semibold">Parameter</th>
                  <th className="px-4 py-3 font-semibold">Value</th>
                  <th className="px-4 py-3 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brd bg-white">
                <tr>
                  <td className="px-4 py-3 font-medium">HbA1c</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">6.1%</td>
                  <td className="px-4 py-3 text-emerald-700">Improving</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">Vitamin D</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">18 ng/mL</td>
                  <td className="px-4 py-3 text-amber-700">Watch</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium">LDL</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">142 mg/dL</td>
                  <td className="px-4 py-3 text-red-700">High</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  )
}
