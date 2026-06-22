import { FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { createFamily, createMember, uploadProfilePhoto } from '../api/family'
import { Alert, Button, Card, SelectField, TextField } from '../components/ui'
import { BrandMark } from '../components/BrandMark'
import { Upload, User, CheckCircle, ChevronRight, UserCircle, Camera } from 'lucide-react'

const bloodGroups = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const genders = ['', 'Female', 'Male', 'Non-binary', 'Prefer not to say']

export default function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [isFlowActive, setIsFlowActive] = useState(false)
  
  const [accountForm, setAccountForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' })
  const [demoForm, setDemoForm] = useState({ dateOfBirth: '', gender: '', bloodGroup: '', familyName: '' })
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user && !isFlowActive) return <Navigate to="/app" replace />

  const handleSubmitStep1 = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    setIsFlowActive(true)
    try {
      await register({
        fullName: accountForm.fullName,
        email: accountForm.email,
        phoneNumber: accountForm.phoneNumber || undefined,
        password: accountForm.password,
      })
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
      setIsFlowActive(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitStep2 = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const familyName = demoForm.familyName || `${accountForm.fullName} Family`
      const family = await createFamily({ familyName })
      const member = await createMember(family.familyId, {
        fullName: accountForm.fullName,
        dateOfBirth: demoForm.dateOfBirth,
        gender: demoForm.gender,
        bloodGroup: demoForm.bloodGroup || undefined,
        relationshipToOwner: 'Self',
      })
      setFamilyId(family.familyId)
      setMemberId(member.memberId)
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmitStep3 = async (e: FormEvent) => {
    e.preventDefault()
    if (!photoFile || !familyId || !memberId) {
       navigate('/app', { replace: true })
       return
    }
    setError('')
    setSubmitting(true)
    try {
      await uploadProfilePhoto(memberId, photoFile)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setSubmitting(false)
    } 
  }

  const handleSkip = () => {
    navigate('/app', { replace: true })
  }

  const stepIndicatorClass = (indicatorStep: number) => {
    const isActive = step === indicatorStep
    const isDone = step > indicatorStep
    return `flex items-center gap-4 transition-opacity ${isActive || isDone ? 'opacity-100' : 'opacity-50'}`
  }

  const stepCircleClass = (indicatorStep: number) => {
    const isActive = step === indicatorStep
    const isDone = step > indicatorStep
    return `flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
      isActive ? 'bg-gradient-to-r from-pri to-sec text-white' :
      isDone ? 'bg-pri/20 text-pri' :
      'bg-sbA text-sbT'
    }`
  }

  const stepLabelClass = (indicatorStep: number) => {
    const isActive = step === indicatorStep
    const isDone = step > indicatorStep
    return `font-bold transition-colors ${isActive || isDone ? 'text-txtP' : 'text-txtS'}`
  }

  return (
    <div className="min-h-screen bg-bg px-4 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <BrandMark />
          <h1 className="mt-10 max-w-xl text-5xl font-black tracking-tight text-txtP">Join AarogyaKul</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-txtS">
            Create your comprehensive health workspace. Your family and member profile are created together so you can start immediately.
          </p>
          
          <div className="mt-12 space-y-6">
            <div className={stepIndicatorClass(1)}>
              <div className={stepCircleClass(1)}>
                {step > 1 ? <CheckCircle size={20} /> : '1'}
              </div>
              <div>
                <h3 className={stepLabelClass(1)}>Account Details</h3>
                <p className="text-sm text-txtS">Secure your family's health data</p>
              </div>
            </div>
            
            <div className={stepIndicatorClass(2)}>
              <div className={stepCircleClass(2)}>
                {step > 2 ? <CheckCircle size={20} /> : <User size={20} />}
              </div>
              <div>
                <h3 className={stepLabelClass(2)}>Personal Profile</h3>
                <p className="text-sm text-txtS">Basic vitals to personalize insights</p>
              </div>
            </div>
            
            <div className={stepIndicatorClass(3)}>
              <div className={stepCircleClass(3)}>
                <Upload size={20} />
              </div>
              <div>
                <h3 className={stepLabelClass(3)}>Profile Avatar</h3>
                <p className="text-sm text-txtS">Add a familiar face to your member card</p>
              </div>
            </div>
          </div>
        </div>

        <Card className="p-5 sm:p-7 relative overflow-hidden">
          <div className="mb-6 lg:hidden"><BrandMark /></div>
          
          {error && <div className="mb-4"><Alert message={error} /></div>}
          
          {step === 1 && (
            <div className="animate-fdIn">
              <div className="mb-6">
                <h2 className="text-3xl font-black tracking-tight text-txtP">Step 1: Account setup</h2>
                <p className="mt-2 text-sm leading-6 text-txtS">Use this to log into the family vault later.</p>
              </div>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmitStep1}>
                <div className="sm:col-span-2">
                  <TextField label="Full name" value={accountForm.fullName} onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })} required />
                </div>
                <TextField label="Email" type="email" value={accountForm.email} onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })} required />
                <TextField label="Phone number (optional)" value={accountForm.phoneNumber} onChange={(e) => setAccountForm({ ...accountForm, phoneNumber: e.target.value })} />
                <div className="sm:col-span-2">
                  <TextField label="Password" type="password" minLength={8} value={accountForm.password} onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })} required />
                </div>
                
                <div className="mt-4 sm:col-span-2">
                  <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={submitting}>
                    {submitting ? 'Creating account...' : 'Continue to Profile'}
                    {!submitting && <ChevronRight size={18} />}
                  </Button>
                  <p className="mt-4 text-center text-sm text-txtS">
                    Already have an account? <Link to="/login" className="font-bold text-pri hover:underline">Log in</Link>
                  </p>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fdIn">
              <div className="mb-6">
                <h2 className="text-3xl font-black tracking-tight text-txtP">Step 2: Basic Demographics</h2>
                <p className="mt-2 text-sm leading-6 text-txtS">This adds you as the primary member of the family.</p>
              </div>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmitStep2}>
                <div className="sm:col-span-2">
                  <TextField label="Family name (optional)" value={demoForm.familyName} placeholder={`${accountForm.fullName} Family`} onChange={(e) => setDemoForm({ ...demoForm, familyName: e.target.value })} />
                </div>
                <TextField label="Date of birth" type="date" value={demoForm.dateOfBirth} onChange={(e) => setDemoForm({ ...demoForm, dateOfBirth: e.target.value })} required />
                <SelectField label="Gender" value={demoForm.gender} onChange={(e) => setDemoForm({ ...demoForm, gender: e.target.value })} required>
                  {genders.map((gender) => <option key={gender} value={gender}>{gender || 'Select gender'}</option>)}
                </SelectField>
                <div className="sm:col-span-2">
                  <SelectField label="Blood group (optional)" value={demoForm.bloodGroup} onChange={(e) => setDemoForm({ ...demoForm, bloodGroup: e.target.value })}>
                    {bloodGroups.map((group) => <option key={group} value={group}>{group || 'Select blood group'}</option>)}
                  </SelectField>
                </div>
                <div className="mt-4 sm:col-span-2">
                  <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={submitting}>
                    {submitting ? 'Setting up Profile...' : 'Complete Profile'}
                    {!submitting && <ChevronRight size={18} />}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fdIn">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-black tracking-tight text-txtP">Step 3: Add a face</h2>
                <p className="mt-2 text-sm leading-6 text-txtS">Personalize your profile member card.</p>
              </div>
              <form className="flex flex-col items-center gap-6" onSubmit={handleSubmitStep3}>
                <div className="relative mt-4 h-32 w-32 shrink-0 overflow-hidden rounded-full bg-pri/10 shadow-inner">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-pri">
                      <UserCircle size={64} className="opacity-40" />
                    </div>
                  )}
                  <label className="absolute bottom-0 left-0 right-0 flex cursor-pointer items-center justify-center bg-black/50 py-1.5 text-xs font-medium text-white transition-opacity hover:bg-black/70">
                    <Camera size={14} className="mr-1.5" />
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                  </label>
                </div>
                
                <div className="max-w-sm text-center text-sm font-medium text-txtS">
                  {photoFile ? photoFile.name : "Select an image file to make your profile recognizable."}
                </div>

                <div className="mt-4 flex w-full flex-col gap-3">
                  <Button className="w-full flex items-center justify-center gap-2" type="submit" disabled={submitting || !photoFile}>
                     <Upload size={18} />
                     {submitting ? 'Uploading...' : 'Upload & Finish'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={handleSkip} disabled={submitting}>
                    Skip for now
                  </Button>
                </div>
              </form>
            </div>
          )}

        </Card>
      </div>
    </div>
  )
}
