import { Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Check,
  FileText,
  LockKeyhole,
  Play,
  ShieldCheck,
  Upload,
} from 'lucide-react'

const normalParameters = [
  { name: 'Fasting blood sugar', value: '108', unit: 'mg/dL', range: '70–110' },
  { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.0–17.0' },
]

const records = [
  { file: 'blood_report_mar_2026.pdf', detail: 'Blood report, 12 Mar 2026', status: 'Analyzed' },
  { file: 'quarterly_checkup.pdf', detail: 'Blood report, 05 Nov 2025', status: 'Analyzed' },
  { file: 'apollo_prescription.pdf', detail: 'Prescription, 02 Apr 2025', status: 'Stored' },
]

export default function LandingPage() {
  const { user, enterDemo } = useAuth()
  const primaryHref = user ? '/app' : '/register'
  const primaryLabel = user ? 'Open dashboard' : 'Create your workspace'

  return (
    <div className="min-h-screen overflow-hidden bg-bg text-deep">
      <header className="border-b border-line bg-surf">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="AarogyaKul home">
            <img src="/logo.svg" alt="" className="h-8 w-8 object-contain" />
            <span className="font-display text-base font-bold tracking-tight">AarogyaKul</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-5" aria-label="Primary navigation">
            <a href="#how-it-works" className="hidden min-h-11 items-center px-2 text-sm font-medium text-mid transition-colors hover:text-deep sm:inline-flex">
              How it works
            </a>
            {!user && <Link to="/login" className="hidden min-h-11 items-center px-3 text-sm font-semibold text-mid sm:inline-flex">Sign in</Link>}
            {user && <Link to="/app" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-focus px-4 text-sm font-semibold text-white">Dashboard <ArrowRight size={15} /></Link>}
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
            <div className="max-w-xl">
              <p className="mb-5 flex items-center gap-2 text-sm font-semibold text-focus">
                <Activity size={16} aria-hidden="true" />
                Family health records, made readable
              </p>
              <h1 className="max-w-lg font-display text-[2.5rem] font-bold leading-[1.08] tracking-[-0.03em] text-deep sm:text-[3.7rem]">
                A medical report is more than a PDF.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-mid sm:text-lg sm:leading-8">
                AarogyaKul turns scattered reports into a connected health record: the original document, the values that need context, and the changes worth discussing.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {!user && (
                  <Link to="/app" onClick={enterDemo} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-focus px-5 text-sm font-semibold text-white">
                    <Play size={16} aria-hidden="true" /> View Live Demo
                  </Link>
                )}
                <Link to={primaryHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-line bg-surf px-5 text-sm font-semibold text-deep">
                  {primaryLabel} <ArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-mid">
                <span className="inline-flex items-center gap-1.5"><LockKeyhole size={14} className="text-ok" /> Your records stay yours</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-ok" /> Built for real families</span>
              </div>
            </div>

            <ReportReader />
          </div>
        </section>

        <section className="border-y border-line bg-surf" aria-labelledby="change-heading">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.76fr_1.24fr] lg:items-center lg:gap-20">
            <div>
              <p className="text-sm font-semibold text-focus">The part a PDF cannot do</p>
              <h2 id="change-heading" className="mt-3 max-w-md font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-deep sm:text-4xl">
                See the change, not just the number.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-mid">
                Each report adds to a member’s history. AarogyaKul makes movement visible without hiding the reference range or the source document.
              </p>
            </div>
            <TrendStory />
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-focus">From upload to insight</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-deep sm:text-4xl">
              A useful record, built in three quiet steps.
            </h2>
          </div>
          <div className="mt-10 grid border-y border-line md:grid-cols-3">
            {[
              { number: '01', title: 'Upload', text: 'Keep the original PDF in one place.', icon: Upload },
              { number: '02', title: 'Extract', text: 'AI turns report text into named, comparable values.', icon: Activity },
              { number: '03', title: 'Follow', text: 'Track what changed across a family member’s timeline.', icon: ArrowDownRight },
            ].map((step, index) => (
              <div key={step.number} className={`py-6 md:px-7 md:py-8 ${index > 0 ? 'border-t border-line md:border-l md:border-t-0' : ''}`}>
                <div className="flex items-center justify-between text-sm font-semibold text-focus">
                  <span>{step.number}</span>
                  <step.icon size={18} aria-hidden="true" />
                </div>
                <h3 className="mt-8 font-display text-xl font-semibold text-deep">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-mid">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-line bg-surf" aria-labelledby="records-heading">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-20">
            <div>
              <p className="text-sm font-semibold text-focus">One place for the family</p>
              <h2 id="records-heading" className="mt-3 max-w-md font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-deep sm:text-4xl">
                Keep every record close to its context.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-mid">
                Reports, prescriptions, allergies, conditions, and timeline events stay organized by family member, so the next appointment starts with the full picture.
              </p>
            </div>
            <RecordList />
          </div>
        </section>

        <section className="bg-deep text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:px-8 sm:py-20 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">Start with the report you already have.</h2>
              <p className="mt-4 text-sm leading-7 text-soft">Create a family workspace and make the next report easier to understand.</p>
            </div>
            <Link to={primaryHref} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-focus px-5 text-sm font-semibold text-white">
              {primaryLabel} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-surf">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-7 text-xs text-mid sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold text-deep"><img src="/logo.svg" alt="" className="h-6 w-6" /> AarogyaKul</Link>
          <span>Family health records, made clearer.</span>
        </div>
      </footer>
    </div>
  )
}

function ReportReader() {
  return (
    <div className="animate-enter relative mx-auto w-full max-w-xl" aria-label="Example of an analyzed blood report">
      <div className="overflow-hidden rounded-lg border border-line bg-surf shadow-lg">
        <div className="flex items-center justify-between border-b border-line bg-deep px-5 py-4 text-white sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10"><FileText size={17} aria-hidden="true" /></div>
            <div className="min-w-0"><p className="truncate text-sm font-semibold">blood_report_mar_2026.pdf</p><p className="mt-1 text-xs text-soft">Rajesh Sharma, 12 Mar 2026</p></div>
          </div>
          <span className="shrink-0 rounded-sm bg-ok/20 px-2 py-1 text-[11px] font-semibold text-white">Analyzed in 2.8s</span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-semibold text-mid">What the report says</p><p className="mt-1 text-xs text-soft">7 values extracted and compared</p></div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ok"><span className="h-2 w-2 rounded-full bg-ok" /> Ready</span>
          </div>

          <div className="mt-5 border-l-[3px] border-alert bg-alert/4 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-xs font-semibold text-alert">Needs attention</p><h3 className="mt-2 font-display text-lg font-semibold text-deep">Vitamin D</h3></div>
              <div className="text-right"><p className="tabular-nums text-2xl font-semibold text-deep">18 <span className="text-xs font-normal text-mid">ng/mL</span></p><p className="mt-1 text-xs font-medium text-alert">Low, high confidence</p></div>
            </div>
            <div className="mt-5">
              <div className="relative h-2 rounded-sm bg-line"><div className="absolute left-[30%] right-0 h-2 rounded-r-sm bg-ok/25" /><div className="absolute left-[18%] top-[-3px] h-3.5 w-3.5 rounded-full border-2 border-surf bg-alert" /></div>
              <div className="mt-2 flex justify-between text-[11px] text-mid"><span>0</span><span>Reference: 30–100</span><span>100</span></div>
            </div>
          </div>

          <div className="mt-5 divide-y divide-line border-y border-line">
            {normalParameters.map((row) => (
              <div key={row.name} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-semibold text-deep">{row.name}</p><p className="mt-1 text-xs text-mid">Reference {row.range}</p></div>
                <p className="tabular-nums shrink-0 text-sm font-semibold text-deep">{row.value} <span className="text-xs font-normal text-mid">{row.unit}</span></p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-mid"><Check size={15} className="mt-0.5 shrink-0 text-ok" /><p><span className="font-semibold text-deep">AI-generated summary</span> is ready with the original report attached.</p></div>
        </div>
      </div>
    </div>
  )
}

function TrendStory() {
  return (
    <div className="rounded-lg border border-line bg-bg p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
        <div><p className="text-xs font-semibold text-mid">HbA1c</p><p className="mt-1 text-xs text-soft">Rajesh Sharma, four reports</p></div>
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-ok/8 px-2 py-1 text-xs font-semibold text-ok"><ArrowDownRight size={14} /> Improving</span>
      </div>
      <div className="flex items-end gap-3 py-7">
        <div><p className="tabular-nums font-display text-4xl font-bold text-deep">7.2%</p><p className="mt-1 text-xs text-mid">Mar 2025</p></div>
        <div className="mb-3 h-px flex-1 bg-line" />
        <div className="text-right"><p className="tabular-nums font-display text-4xl font-bold text-ok">6.1%</p><p className="mt-1 text-xs text-mid">Mar 2026</p></div>
      </div>
      <div className="relative h-14 overflow-hidden rounded-sm border border-line bg-surf" aria-label="HbA1c trend from 7.2 to 6.1 percent">
        <div className="absolute inset-x-0 top-7 border-t border-dashed border-line" />
        <svg viewBox="0 0 500 70" className="absolute inset-0 h-full w-full" role="img" aria-label="Downward HbA1c trend line">
          <path d="M0 12 C90 20, 150 28, 230 34 S380 54, 500 58" fill="none" stroke="currentColor" strokeWidth="3" className="text-focus" />
          <circle cx="0" cy="12" r="5" fill="currentColor" className="text-focus" /><circle cx="500" cy="58" r="5" fill="currentColor" className="text-ok" />
        </svg>
      </div>
      <p className="mt-4 text-xs leading-5 text-mid">A change you can bring into the next conversation, with every underlying report still available.</p>
    </div>
  )
}

function RecordList() {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-bg" aria-label="Recent family records">
      <div className="flex items-center justify-between border-b border-line bg-surf px-5 py-4">
        <div><h3 className="text-sm font-semibold text-deep">Rajesh Sharma's records</h3><p className="mt-1 text-xs text-mid">3 documents, one connected history</p></div>
        <FileText size={18} className="text-mid" aria-hidden="true" />
      </div>
      <div className="divide-y divide-line">
        {records.map((record) => (
          <div key={record.file} className="flex items-center justify-between gap-4 bg-surf px-5 py-4">
            <div className="min-w-0"><p className="truncate text-sm font-semibold text-deep">{record.file}</p><p className="mt-1 text-xs text-mid">{record.detail}</p></div>
            <span className={`shrink-0 rounded-sm px-2 py-1 text-[11px] font-semibold ${record.status === 'Analyzed' ? 'bg-ok/8 text-ok' : 'bg-bg text-mid'}`}>{record.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
