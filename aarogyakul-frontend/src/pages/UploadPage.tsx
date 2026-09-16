import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { getDocument, listDocuments, uploadDocument, retryDocument, getDocumentStatus } from '../api/documents'
import { Alert, LoadingState, StatusBadge, SelectField } from '../components/ui'
import type { DocumentType, DocumentResponse, DocumentSummaryResponse, ParameterResponse } from '../types/api'
import { documentTypeLabel, formatDate, formatDateTime } from '../utils/format'
import { AlertCircle, FileText, ArrowLeft, Download, ShieldCheck, ChevronRight, Calendar, Clock, Activity, UploadCloud, CheckCircle2, Sparkles } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { isDemoMode } from '../demo/demoApi'


const maxPdfSize = 15 * 1024 * 1024

const PIPELINE_STAGES = [
  { key: 'EXTRACTING_TEXT', label: 'File uploaded', time: '2s' },
  { key: 'IDENTIFYING_PARAMETERS', label: 'Reading document', time: '5s' },
  { key: 'COMPARING_HISTORY', label: 'Extracting values', time: '8s' },
  { key: 'GENERATING_SUMMARY', label: 'Analyzing with AI', time: 'Processing...' },
  { key: 'COMPLETED', label: 'Generating summary', time: '' },
]

function FormattedText({ text }: { text: string }) {
  if (!text) return null
  return (
    <>
      {text.split('\n').map((line, i, arr) => (
        <span key={i}>
          {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-semibold text-deep">{part.slice(2, -2)}</strong>
            }
            return <span key={j}>{part}</span>
          })}
          {i < arr.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}

export default function UploadPage() {
  const { activeProfile } = useProfile()
  const memberId = activeProfile?.memberId || ''
  const [searchParams, setSearchParams] = useSearchParams()
  const [documents, setDocuments] = useState<DocumentSummaryResponse[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>('LAB_REPORT')

  const selectedDocumentId = searchParams.get('document')

  const load = useCallback(async () => {
    setError('')
    try {
      const result = await listDocuments(memberId)
      setDocuments(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load documents')
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!selectedDocumentId) {
      setSelectedDocument(null)
      return
    }
    void getDocument(selectedDocumentId).then(setSelectedDocument).catch((err) => setError(err instanceof Error ? err.message : 'Could not load document'))
  }, [selectedDocumentId])

  const hasProcessingDocs = documents.some((doc) => doc.processingStatus === 'PENDING' || doc.processingStatus === 'PROCESSING')
  useEffect(() => {
    if (!hasProcessingDocs) return
    const backgroundPoll = window.setInterval(() => {
      void load()
    }, 5000)
    return () => window.clearInterval(backgroundPoll)
  }, [hasProcessingDocs, load])

  const refreshSelectedDocument = useCallback(() => {
    void load()
    if (selectedDocumentId) {
      void getDocument(selectedDocumentId).then(setSelectedDocument).catch(() => {})
    }
  }, [selectedDocumentId, load])

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }
  const onDragLeave = () => setIsDragActive(false)

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    setError('')
    if (isDemoMode()) {
      setError('You are viewing a live demo. Uploads are disabled.')
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      return
    }
    if (file.size > maxPdfSize) {
      setError('PDF must be 15MB or smaller.')
      return
    }

    setUploading(true)
    try {
      const result = await uploadDocument(memberId, file, selectedDocumentType)
      await load()
      setSearchParams({ document: result.documentId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSampleReport = async () => {
    setError('')
    if (isDemoMode()) {
      setError('You are viewing a live demo. Uploads are disabled.')
      return
    }
    setUploading(true)
    try {
      const response = await fetch('/sample-report.pdf')
      if (!response.ok) throw new Error('Sample report not found')
      const blob = await response.blob()
      const file = new File([blob], 'sample-report.pdf', { type: 'application/pdf' })
      const result = await uploadDocument(memberId, file, 'LAB_REPORT')
      await load()
      setSearchParams({ document: result.documentId })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sample report')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <LoadingState label="Loading AI Report Reader" />

  const recentDocs = documents.slice(0, 3)

  return (
    <div className="pb-16 w-full">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-display font-semibold tracking-tight text-deep sm:text-3xl">AI Report Reader</h1>
          <p className="mt-1 text-sm text-mid">Upload a medical report and get clear, structured insights with the power of AI.</p>
        </div>
      </div>

      {error ? <div className="mb-4"><Alert message={error} /></div> : null}

      <div className={`grid gap-6 ${selectedDocument ? 'lg:grid-cols-[1fr_300px]' : ''}`}>
        {/* Left Column — upload area + document content */}
        <div>
          {/* Hero Upload & Recent */}
          <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div 
              className={`flex flex-col items-start justify-center rounded-xl border-2 border-dashed bg-surf p-8 transition-colors ${
                isDragActive ? 'border-focus bg-focus/5' : 'border-line hover:border-focus/50 hover:bg-slate-50'
              }`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-focus/10 text-focus">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="mb-1 text-base font-semibold text-deep">Drag and drop your report here</p>
              <p className="mb-6 text-sm text-mid text-left">
                or <label className="cursor-pointer font-medium text-focus hover:underline">click to browse<input type="file" className="hidden" accept="application/pdf,.pdf" onChange={handleFileSelect} disabled={uploading} /></label>
              </p>
              
              <div className="mb-8 w-full max-w-sm">
                <SelectField 
                  label="Document Type" 
                  value={selectedDocumentType} 
                  onChange={(e) => setSelectedDocumentType(e.target.value as DocumentType)}
                  disabled={uploading}
                >
                  <option value="LAB_REPORT">Lab Report</option>
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="VACCINATION">Vaccination</option>
                  <option value="BILL">Medical Bill</option>
                  <option value="OTHER">Other / Generic</option>
                </SelectField>
              </div>

              <p className="text-xs text-soft mb-8">Supports PDF, JPG, PNG (Max 15 MB)</p>
              
              <div className="flex w-full items-center justify-between rounded-lg border border-line bg-bg p-4">
                <div>
                  <p className="text-sm font-semibold text-deep">Try a sample report</p>
                  <p className="text-xs text-mid">Explore with a sample report to see how it works.</p>
                </div>
                <button onClick={handleSampleReport} disabled={uploading} className="rounded-md border border-line bg-surf px-4 py-2 text-sm font-medium text-deep shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50">
                  <FileText className="mr-2 inline h-4 w-4" /> Use Sample Report
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surf p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-deep">Your Recent Reports</h3>
                <button className="text-sm font-medium text-focus hover:underline">View all &rarr;</button>
              </div>
              <div className="space-y-3">
                {recentDocs.length === 0 ? (
                  <p className="text-sm text-mid">No reports uploaded yet.</p>
                ) : (
                  recentDocs.map(doc => (
                    <button 
                      key={doc.documentId}
                      onClick={() => setSearchParams({ document: doc.documentId })}
                      className={`flex w-full items-center justify-between rounded-lg border border-line p-3 transition-colors hover:bg-slate-50 ${selectedDocumentId === doc.documentId ? 'border-focus bg-focus/5' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-bg text-mid">
                          <FileText size={18} />
                        </div>
                        <div className="text-left">
                          <p className="truncate text-sm font-semibold text-deep">{doc.fileName}</p>
                          <p className="text-xs text-mid">{formatDate(doc.uploadedAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={doc.processingStatus} />
                        <ChevronRight className="h-4 w-4 text-soft" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {selectedDocument && (
            <DocumentDetailDashboard 
              document={selectedDocument} 
              onRefresh={refreshSelectedDocument} 
              onClear={() => setSearchParams({})}
            />
          )}
        </div>

        {/* Right Column — document details sidebar (spans full height) */}
        {selectedDocument && (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border border-line bg-surf p-5">
              <h3 className="mb-4 text-base font-semibold text-deep">Original Document</h3>
              <div className="mb-4 overflow-hidden rounded-lg border border-line bg-bg">
                {selectedDocument.thumbnailUrl ? (
                  <img src={selectedDocument.thumbnailUrl} alt="Document thumbnail" className="h-40 w-full object-cover object-top" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center text-soft">
                    <FileText className="h-8 w-8" />
                  </div>
                )}
              </div>
              <p className="truncate text-sm font-semibold text-deep">{selectedDocument.fileName}</p>
              <p className="mb-3 text-xs text-mid">
                {selectedDocument.fileSizeBytes ? `${(selectedDocument.fileSizeBytes / 1024 / 1024).toFixed(1)} MB · ` : ''}{formatDate(selectedDocument.uploadedAt)}
              </p>
              <div className="flex gap-2">
                <a href={selectedDocument.fileUrl} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center rounded-md border border-line bg-surf px-3 py-1.5 text-xs font-medium text-deep shadow-sm hover:bg-slate-50">View</a>
                <a href={selectedDocument.fileUrl} download className="flex flex-1 items-center justify-center gap-1 rounded-md border border-line bg-surf px-3 py-1.5 text-xs font-medium text-deep shadow-sm hover:bg-slate-50"><Download size={12} /> Download</a>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surf p-5">
              <h3 className="mb-4 text-sm font-semibold text-deep">Report Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-mid" />
                  <div>
                    <p className="text-xs text-mid">Report Date</p>
                    <p className="text-sm font-medium text-deep">{formatDate(selectedDocument.reportDate)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 text-mid" />
                  <div>
                    <p className="text-xs text-mid">Upload Date</p>
                    <p className="text-sm font-medium text-deep">{formatDateTime(selectedDocument.uploadedAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-mid" />
                  <div>
                    <p className="text-xs text-mid">Report Type</p>
                    <p className="text-sm font-medium text-deep">{documentTypeLabel(selectedDocument.documentType)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="mt-0.5 h-4 w-4 text-mid" />
                  <div>
                    <p className="text-xs text-mid">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={selectedDocument.processingStatus} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#1A7A4C]/20 bg-[#1A7A4C]/5 p-4 text-[#1A7A4C]">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">AI-generated summary. Not a substitute for professional medical advice.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentDetailDashboard({ document, onRefresh, onClear }: { document: DocumentResponse; onRefresh: () => void; onClear: () => void }) {
  const [processingStage, setProcessingStage] = useState<{ stage: string; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState('Summary')
  const [retrying, setRetrying] = useState(false)
  const [simulatedStageIndex, setSimulatedStageIndex] = useState(0)

  const isProcessing = document.processingStatus === 'PENDING' || document.processingStatus === 'PROCESSING'
  const isFailed = document.processingStatus === 'FAILED'

  useEffect(() => {
    if (!isProcessing) return
    const times = [3000, 6000, 5000, 6000, 10000]
    let timeout: number
    const advance = () => {
      setSimulatedStageIndex(prev => {
        if (prev < PIPELINE_STAGES.length - 1) {
          timeout = window.setTimeout(advance, times[prev + 1])
          return prev + 1
        }
        return prev
      })
    }
    timeout = window.setTimeout(advance, times[0])
    return () => window.clearTimeout(timeout)
  }, [isProcessing])

  useEffect(() => {
    if (document.processingStatus !== 'PENDING' && document.processingStatus !== 'PROCESSING') return

    const pollStatus = async () => {
      try {
        const data = await getDocumentStatus(document.documentId)
        setProcessingStage(data)
        if (data.stage === 'COMPLETED' || data.stage === 'FAILED') onRefresh()
      } catch (err) {
        console.warn('Failed to fetch status', err)
      }
    }

    const stageInterval = window.setInterval(pollStatus, 2000)
    const refreshInterval = window.setInterval(onRefresh, 5000)
    
    // Initial fetch
    void pollStatus()

    return () => {
      window.clearInterval(stageInterval)
      window.clearInterval(refreshInterval)
    }
  }, [document.documentId, document.processingStatus, onRefresh])

  const handleRetry = async () => {
    setRetrying(true)
    try {
      await retryDocument(document.documentId)
      onRefresh()
    } finally {
      setRetrying(false)
    }
  }
  
  const parameterWithStatus = useCallback((p: ParameterResponse) => {
    if (p.referenceRangeLow == null || p.referenceRangeHigh == null) return { ...p, status: 'unknown' }
    if (p.value < p.referenceRangeLow) return { ...p, status: 'low' }
    if (p.value > p.referenceRangeHigh) return { ...p, status: 'high' }
    return { ...p, status: 'normal' }
  }, [])

  const categorized = useMemo(() => document.parameters ? document.parameters.map(parameterWithStatus) : [], [document.parameters, parameterWithStatus])
  const anomalies = categorized.filter((p) => p.status === 'low' || p.status === 'high')
  const normalCount = categorized.filter((p) => p.status === 'normal').length
  const totalCount = document.parameters?.length || 0
  
  const hasLabData = document.parameters && document.parameters.length > 0;
  const hasPrescriptionData = document.prescriptions && document.prescriptions.length > 0;
  const hasVaccinationData = document.vaccinations && document.vaccinations.length > 0;
  const hasBillData = document.medicalBills && document.medicalBills.length > 0;
  const hasMetadata = document.extractedMetadata && Object.keys(document.extractedMetadata).length > 0;
  
  const tabs = ['Summary']
  if (hasLabData) tabs.push('All Parameters')
  if (hasPrescriptionData) tabs.push('Prescription Details')
  if (hasVaccinationData) tabs.push('Vaccinations')
  if (hasBillData) tabs.push('Bill Details')
  if (hasMetadata && !hasLabData && !hasPrescriptionData && !hasVaccinationData && !hasBillData) tabs.push('Metadata')



  if (isProcessing) {
    const currentIndex = processingStage ? PIPELINE_STAGES.findIndex(s => s.key === processingStage.stage) : 0
    const activeIndex = Math.max(currentIndex, simulatedStageIndex)
    const currentLabel = PIPELINE_STAGES[Math.min(activeIndex, PIPELINE_STAGES.length - 1)].label

    return (
      <div className="mb-8 rounded-xl border border-line bg-surf p-10 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-2 border-dashed border-focus/40"></div>
            <div className="absolute h-16 w-16 animate-pulse rounded-full bg-focus/20 blur-xl"></div>
            <Sparkles className="relative z-10 h-8 w-8 text-focus" />
          </div>
          <h3 className="mb-3 font-serif text-xl font-bold text-deep">Analyzing your report</h3>
          <p className="min-h-6 text-sm font-medium text-focus transition-all duration-300">{currentLabel}...</p>
          <p className="mt-2 text-xs text-mid">This usually takes about 15-20 seconds.</p>
        </div>
      </div>
    )
  }

  if (isFailed) {
    return (
      <div className="rounded-xl border border-alert/20 bg-alert/5 p-6 mb-8 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-alert" />
        <h3 className="text-base font-semibold text-alert">AI Processing Failed</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-deep font-medium">We couldn't fully process this document. You can try uploading a clearer scan, or try again.</p>
        {document.processingError && <p className="mt-2 text-xs text-alert">{document.processingError}</p>}
        <button onClick={handleRetry} disabled={retrying} className="mt-4 rounded-md bg-surf border border-line px-4 py-2 text-sm font-semibold text-focus shadow-sm hover:bg-bg disabled:opacity-50">
          {retrying ? 'Retrying...' : 'Retry Processing'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button onClick={onClear} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-mid hover:text-deep transition-colors">
          <ArrowLeft size={16} /> Back to uploads
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-semibold text-deep">{document.fileName}</h2>
            <p className="mt-1 text-sm text-mid">Processed on {formatDateTime(document.uploadedAt)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-bg p-1">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            className={`flex-1 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all ${activeTab === tab ? 'bg-surf text-deep shadow-sm' : 'text-mid hover:text-deep'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Summary' && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-line bg-surf p-5">
            <h3 className="mb-4 text-base font-semibold text-deep">Overall Summary</h3>
            
            {document.insight?.summaryText && (
              <p className="mb-6 text-sm leading-relaxed text-deep">
                <FormattedText text={document.insight.summaryText} />
              </p>
            )}
            
            {hasLabData && (
              <>
                {anomalies.length > 0 ? (
                  <div className="mb-5 flex items-start gap-3 rounded-md bg-attn/10 p-4 text-attn">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">{anomalies.length} value{anomalies.length > 1 ? 's are' : ' is'} outside the normal range</p>
                      <p className="mt-1 text-xs">Most values are within normal range. Please review the flagged parameters and consider consulting a healthcare professional.</p>
                    </div>
                  </div>
                ) : (
                  <div className="mb-5 flex items-start gap-3 rounded-md bg-ok/10 p-4 text-ok">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold">All values are within normal range</p>
                      <p className="mt-1 text-xs">No flagged parameters found in this report.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-md bg-bg p-3">
                    <p className="text-xs text-mid mb-1">Total</p>
                    <p className="text-lg font-semibold text-deep">{totalCount}</p>
                  </div>
                  <div className="rounded-md bg-bg p-3">
                    <p className="text-xs text-mid mb-1">Normal</p>
                    <p className="text-lg font-semibold text-ok">{normalCount}</p>
                  </div>
                  <div className="rounded-md bg-bg p-3">
                    <p className="text-xs text-mid mb-1">Abnormal</p>
                    <p className="text-lg font-semibold text-alert">{anomalies.length}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {hasLabData && anomalies.length > 0 && (
            <div className="rounded-xl border border-line bg-surf p-5">
              <h3 className="mb-4 text-base font-semibold text-deep">Key Findings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {anomalies.map((p, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border border-line bg-bg p-3 shadow-sm border-l-4 border-l-alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-alert" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-deep" title={p.parameterName}>{p.parameterName}</span>
                        <span className="shrink-0 rounded bg-alert/10 px-1.5 py-0.5 text-[10px] font-bold text-alert uppercase">{p.status}</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-deep">{p.value} <span className="text-xs font-normal text-mid">{p.unit}</span></p>
                      <p className="mt-1 text-xs text-mid">Normal: {p.referenceRangeLow} - {p.referenceRangeHigh}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'All Parameters' && hasLabData && (
        <div className="rounded-xl border border-line bg-surf p-5">
          <h3 className="mb-4 text-base font-semibold text-deep">All Parameters</h3>
          <div className="divide-y divide-line border-t border-line">
            {document.parameters!.map((p, i) => (
              <div key={i} className="flex justify-between py-3">
                <span className="text-sm font-medium text-deep">{p.parameterName}</span>
                <span className="text-sm text-mid">{p.value} {p.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Prescription Details' && hasPrescriptionData && (
        <div className="rounded-xl border border-line bg-surf p-5">
          <h3 className="mb-4 text-base font-semibold text-deep">Prescribed Medications</h3>
          <div className="space-y-4">
            {document.prescriptions!.map((p, i) => (
              <div key={i} className="rounded-lg border border-line p-4">
                <p className="font-semibold text-deep">{p.medicationName}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-mid">Dosage:</span> <span className="text-deep">{p.dosage || 'N/A'}</span></div>
                  <div><span className="text-mid">Freq:</span> <span className="text-deep">{p.frequency || 'N/A'}</span></div>
                  <div><span className="text-mid">Duration:</span> <span className="text-deep">{p.duration || 'N/A'}</span></div>
                  <div><span className="text-mid">Doctor:</span> <span className="text-deep">{p.prescribingDoctor || 'N/A'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Vaccinations' && hasVaccinationData && (
        <div className="rounded-xl border border-line bg-surf p-5">
          <h3 className="mb-4 text-base font-semibold text-deep">Vaccinations</h3>
          <div className="space-y-4">
            {document.vaccinations!.map((v, i) => (
              <div key={i} className="rounded-lg border border-line p-4">
                <p className="font-semibold text-deep">{v.vaccineName}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-mid">Dose:</span> <span className="text-deep">{v.doseNumber || 'N/A'}</span></div>
                  <div><span className="text-mid">Date:</span> <span className="text-deep">{v.dateAdministered ? formatDate(v.dateAdministered) : 'N/A'}</span></div>
                  <div><span className="text-mid">Administered By:</span> <span className="text-deep">{v.administeredBy || 'N/A'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Bill Details' && hasBillData && (
        <div className="rounded-xl border border-line bg-surf p-5">
          <h3 className="mb-4 text-base font-semibold text-deep">Medical Bills</h3>
          <div className="space-y-4">
            {document.medicalBills!.map((b, i) => (
              <div key={i} className="rounded-lg border border-line p-4">
                <p className="font-semibold text-deep">{b.providerName}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-mid">Amount:</span> <span className="text-deep">{b.totalAmount ? `₹${b.totalAmount}` : 'N/A'}</span></div>
                  <div><span className="text-mid">Date:</span> <span className="text-deep">{b.dateOfService ? formatDate(b.dateOfService) : 'N/A'}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Metadata' && hasMetadata && (
        <div className="rounded-xl border border-line bg-surf p-5">
          <h3 className="mb-4 text-base font-semibold text-deep">Extracted Metadata</h3>
          <pre className="overflow-x-auto rounded-lg bg-bg p-4 text-sm text-deep">
            {JSON.stringify(document.extractedMetadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
