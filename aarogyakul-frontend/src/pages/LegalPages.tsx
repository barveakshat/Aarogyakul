import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'

export function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 2026">
      <Section title="1. Information We Collect">
        <p>AarogyaKul collects the minimum information needed to provide our health record management service:</p>
        <ul>
          <li><strong>Account data:</strong> email address, name, and password (hashed).</li>
          <li><strong>Health records:</strong> medical documents, lab reports, and clinical notes you upload.</li>
          <li><strong>AI-processed data:</strong> extracted parameters, insights, and summaries generated from your documents.</li>
        </ul>
      </Section>
      <Section title="2. How We Use Your Data">
        <ul>
          <li>To store, organize, and display your medical records securely.</li>
          <li>To generate AI-powered health insights and trend analysis.</li>
          <li>To maintain and improve our service quality.</li>
        </ul>
        <p>We <strong>never</strong> sell your data or share it with third-party advertisers.</p>
      </Section>
      <Section title="3. Data Storage &amp; Security">
        <p>Your data is encrypted in transit (TLS) and at rest. Medical documents are stored in secure cloud storage with access controls. Only you and your authorized family members can access your health records.</p>
      </Section>
      <Section title="4. AI Processing">
        <p>We use large language models to extract medical parameters and generate insights from your documents. Document text is sent to our AI provider for processing. We do not use your data to train AI models.</p>
      </Section>
      <Section title="5. Data Deletion">
        <p>You can delete any document, member profile, or your entire account at any time. Deleted data is soft-deleted and permanently purged after 30 days.</p>
      </Section>
      <Section title="6. Contact">
        <p>For privacy concerns, contact us at <strong>privacy@aarogyakul.in</strong>.</p>
      </Section>
    </LegalShell>
  )
}

export function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="July 2026">
      <Section title="1. Acceptance">
        <p>By using AarogyaKul, you agree to these terms. If you disagree, please do not use the service.</p>
      </Section>
      <Section title="2. Service Description">
        <p>AarogyaKul is a personal health record management platform that helps you store, organize, and analyze your medical documents using AI. It is <strong>not</strong> a substitute for professional medical advice.</p>
      </Section>
      <Section title="3. Your Responsibilities">
        <ul>
          <li>Provide accurate information when creating your account.</li>
          <li>Keep your login credentials secure.</li>
          <li>Ensure uploaded documents are your own or you have authorization to manage them.</li>
          <li>Consult qualified healthcare professionals for medical decisions.</li>
        </ul>
      </Section>
      <Section title="4. AI Disclaimer">
        <p>AI-generated insights are for <strong>informational purposes only</strong>. They may contain errors and should not be relied upon as medical diagnosis or treatment recommendations. Always verify AI outputs with a qualified healthcare provider.</p>
      </Section>
      <Section title="5. Limitation of Liability">
        <p>AarogyaKul is provided "as is" without warranties. We are not liable for any health decisions made based on AI-generated insights or for data loss beyond reasonable recovery efforts.</p>
      </Section>
      <Section title="6. Changes">
        <p>We may update these terms. Continued use after changes constitutes acceptance.</p>
      </Section>
    </LegalShell>
  )
}

function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-pri hover:underline">
        <ArrowLeft size={16} />Back to Home
      </Link>
      <h1 className="text-3xl font-black text-txtP">{title}</h1>
      <p className="mt-2 text-sm text-txtS">Last updated: {updated}</p>
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold text-txtP">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-txtS [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_strong]:text-txtP">
        {children}
      </div>
    </section>
  )
}
