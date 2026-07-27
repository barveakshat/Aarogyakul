import { useCallback, useEffect, useState } from 'react'
import { useProfile } from '../context/ProfileContext'
import { getTrackedParameters, getParameterTrend } from '../api/parameters'
import { Card, EmptyState, LoadingState, PageHeader, SelectField } from '../components/ui'
import type { ParameterTrendResponse } from '../types/api'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceArea, ReferenceLine
} from 'recharts'
import { TrendingUp } from 'lucide-react'

export default function TrendsPage() {
  const { activeProfile } = useProfile()
  const memberId = activeProfile?.memberId || ''
  const [parameterNames, setParameterNames] = useState<string[]>([])
  const [selectedParam, setSelectedParam] = useState('')
  const [trend, setTrend] = useState<ParameterTrendResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [trendLoading, setTrendLoading] = useState(false)

  useEffect(() => {
    if (!memberId) return
    setLoading(true)
    getTrackedParameters(memberId)
      .then(result => {
        setParameterNames(result.parameterNames)
        if (result.parameterNames.length > 0) {
          setSelectedParam(result.parameterNames[0])
        }
      })
      .finally(() => setLoading(false))
  }, [memberId])

  const loadTrend = useCallback(async (name: string) => {
    if (!memberId || !name) return
    setTrendLoading(true)
    try {
      const result = await getParameterTrend(memberId, name)
      setTrend(result)
    } finally {
      setTrendLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    if (selectedParam) void loadTrend(selectedParam)
  }, [selectedParam, loadTrend])

  if (loading) return <LoadingState label="Loading trends" />

  if (parameterNames.length === 0) {
    return (
      <>
        <PageHeader title="Health Trends" description="Track how your lab parameters change over time." />
        <EmptyState
          title="No parameters tracked yet"
          description="Upload a blood report or lab report to start seeing your health trends over time."
        />
      </>
    )
  }

  const chartData = trend?.dataPoints.map(dp => ({
    date: dp.date,
    value: dp.value,
    refLow: dp.referenceRangeLow ?? undefined,
    refHigh: dp.referenceRangeHigh ?? undefined,
  })) ?? []

  // Calculate reference range for the area band (use first data point's reference)
  const refLow = chartData.find(d => d.refLow !== undefined)?.refLow
  const refHigh = chartData.find(d => d.refHigh !== undefined)?.refHigh

  // Latest value for summary card
  const latest = chartData.length > 0 ? chartData[chartData.length - 1] : null
  const isInRange = latest && refLow !== undefined && refHigh !== undefined
    ? latest.value >= refLow && latest.value <= refHigh
    : null

  return (
    <>
      <PageHeader
        title="Health Trends"
        description="Track how your lab parameters change over time with visual trend analysis."
      />

      <div className="mb-6 max-w-xs">
        <SelectField
          label="Select Parameter"
          value={selectedParam}
          onChange={e => setSelectedParam(e.target.value)}
        >
          {parameterNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </SelectField>
      </div>

      {trendLoading ? (
        <LoadingState label="Loading trend data" />
      ) : trend && chartData.length > 0 ? (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-txtS">Latest Value</div>
              <div className="mt-2 text-3xl font-black text-pri">
                {latest?.value ?? '—'}
                <span className="ml-1 text-base font-medium text-txtS">{trend.unit}</span>
              </div>
              {isInRange !== null && (
                <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  isInRange
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${isInRange ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {isInRange ? 'In Range' : 'Out of Range'}
                </div>
              )}
            </Card>
            <Card className="p-5">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-txtS">Readings</div>
              <div className="mt-2 text-3xl font-black text-pri">{chartData.length}</div>
              <div className="mt-2 text-xs text-txtS">data points tracked</div>
            </Card>
            {refLow !== undefined && refHigh !== undefined && (
              <Card className="p-5">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-txtS">Reference Range</div>
                <div className="mt-2 text-3xl font-black text-pri">
                  {refLow} – {refHigh}
                </div>
                <div className="mt-2 text-xs text-txtS">{trend.unit}</div>
              </Card>
            )}
          </div>

          {/* Trend chart */}
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pri" />
              <h2 className="text-base font-black text-txtP">{trend.parameterName} Trend</h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#0F172A',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      padding: '10px 14px',
                    }}
                    labelStyle={{ color: '#94A3B8', marginBottom: '4px' }}
                    formatter={(value: number) => [`${value} ${trend.unit}`, trend.parameterName]}
                  />

                  {/* Reference range band */}
                  {refLow !== undefined && refHigh !== undefined && (
                    <ReferenceArea y1={refLow} y2={refHigh} fill="#10B981" fillOpacity={0.08} strokeOpacity={0} />
                  )}
                  {refLow !== undefined && (
                    <ReferenceLine y={refLow} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1} />
                  )}
                  {refHigh !== undefined && (
                    <ReferenceLine y={refHigh} stroke="#10B981" strokeDasharray="4 4" strokeWidth={1} />
                  )}

                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366F1"
                    strokeWidth={2.5}
                    dot={{ fill: '#6366F1', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#6366F1', stroke: '#fff', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {refLow !== undefined && refHigh !== undefined && (
              <div className="mt-4 flex items-center gap-4 text-xs text-txtS">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-6 rounded-sm bg-emerald-100 border border-emerald-300" />
                  Normal range ({refLow}–{refHigh} {trend.unit})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-0.5 w-6 bg-pri rounded" />
                  Your readings
                </span>
              </div>
            )}
          </Card>
        </>
      ) : (
        <EmptyState
          title="Not enough data"
          description={`Upload more reports containing "${selectedParam}" to see a trend chart.`}
        />
      )}
    </>
  )
}
