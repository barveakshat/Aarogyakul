import { FormEvent, useState, useRef } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { Alert, Button, Card, PasswordField, TextField, SelectField } from '../components/ui'
import { BrandMark } from '../components/BrandMark'
import { ChevronRight, ChevronLeft, Upload, CheckCircle2, Lock } from 'lucide-react'

export default function RegisterPage() {
  const { register, user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [accountForm, setAccountForm] = useState({ fullName: '', email: '', password: '' })
  const [memberForm, setMemberForm] = useState({
    memberName: '',
    memberDob: '',
    memberGender: 'Male',
    memberRelationship: 'Self',
    memberBloodGroup: ''
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | undefined }>({})
  const [submitting, setSubmitting] = useState(false)

  // Only auto-redirect if they are already logged in and not at the success step
  if (user && step !== 4) return <Navigate to="/app" replace />

  const validateStep1 = (): boolean => {
    const errors: Record<string, string> = {}
    if (!accountForm.fullName.trim()) errors.fullName = 'Full name is required'
    const trimmedEmail = accountForm.email.trim()
    if (!trimmedEmail) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address'
    }
    if (!accountForm.password) {
      errors.password = 'Password is required'
    } else if (accountForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {}
    if (!memberForm.memberName.trim()) errors.memberName = 'Name is required'
    if (!memberForm.memberDob) errors.memberDob = 'Date of birth is required'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (step === 1) {
      if (validateStep1()) {
        // Pre-fill member name with account full name if empty
        if (!memberForm.memberName) {
          setMemberForm(prev => ({ ...prev, memberName: accountForm.fullName }))
        }
        setStep(2)
      }
    } else if (step === 2) {
      if (validateStep2()) setStep(3)
    }
  }

  const handleBack = () => {
    setError('')
    setStep(prev => Math.max(1, prev - 1))
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File is too large (max 5MB).')
      return
    }
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
    setError('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({
        fullName: accountForm.fullName.trim(),
        email: accountForm.email.trim(),
        password: accountForm.password,
        memberName: memberForm.memberName.trim(),
        memberDob: memberForm.memberDob,
        memberGender: memberForm.memberGender,
        memberRelationship: memberForm.memberRelationship,
        memberBloodGroup: memberForm.memberBloodGroup || undefined
      }, photoFile || undefined)
      
      setStep(4)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('email')) {
        setStep(1)
        setFieldErrors({ email: msg })
      } else {
        setError(msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const stepLabels = ['Account Details', 'Your First Member', 'Personalize']

  return (
    <div className="min-h-screen bg-bg px-4 py-8 flex flex-col">
      {/* Top Bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between pb-8">
        <BrandMark />
        <div className="flex items-center gap-2 text-sm font-medium text-mid">
          <Lock size={16} /> Secure & private
        </div>
      </header>

      <div className="mx-auto grid flex-1 w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          {step === 1 && (
            <div className="animate-enter">
              <h1 className="max-w-xl font-display text-4xl font-bold tracking-tight text-deep">A healthier tomorrow, together.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-mid">Create your account to start organizing your family's health records.</p>
              <ul className="mt-8 space-y-4 text-sm text-mid">
                <li className="flex gap-3"><CheckCircle2 className="text-pri h-5 w-5" /> Your data stays private</li>
                <li className="flex gap-3"><CheckCircle2 className="text-pri h-5 w-5" /> Built for families</li>
                <li className="flex gap-3"><CheckCircle2 className="text-pri h-5 w-5" /> Simple, secure, and reliable</li>
              </ul>
            </div>
          )}
          {step === 2 && (
            <div className="animate-enter">
              <h1 className="mt-10 max-w-xl font-display text-4xl font-bold tracking-tight text-deep">It starts with family.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-mid">Add your first family member to get a personalized experience. You can always add more members later.</p>
              <ul className="mt-8 space-y-4 text-sm text-mid">
                <li className="flex gap-3"><CheckCircle2 className="text-pri h-5 w-5" /> Track health for all ages</li>
                <li className="flex gap-3"><CheckCircle2 className="text-pri h-5 w-5" /> Add multiple family members</li>
                <li className="flex gap-3"><CheckCircle2 className="text-pri h-5 w-5" /> Get personalized insights</li>
              </ul>
            </div>
          )}
          {step === 3 && (
            <div className="animate-enter">
              <h1 className="mt-10 max-w-xl font-display text-4xl font-bold tracking-tight text-deep">Make it personal.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-mid">Add a profile photo to help identify this family member easily. This helps personalize the experience.</p>
            </div>
          )}
          {step === 4 && (
            <div className="animate-enter">
              <h1 className="max-w-xl font-display text-4xl font-bold tracking-tight text-deep">You're all set!</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-mid">Welcome to AarogyaKul! Your account is ready and your first family member has been added.</p>
            </div>
          )}
        </div>

        <Card className="p-5 sm:p-7 relative overflow-hidden">
          
          {error && <div className="mb-4"><Alert message={error} /></div>}
          
          {step < 4 && (
            <div className="mb-10 relative z-0">
              <div className="absolute top-3 left-[15%] right-[15%] h-[2px] bg-line -z-10"></div>
              <div 
                className="absolute top-3 left-[15%] h-[2px] bg-deep -z-10 transition-all duration-300"
                style={{ width: `${((step - 1) / (stepLabels.length - 1)) * 70}%` }}
              />
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                {stepLabels.map((label, idx) => {
                  const stepNum = idx + 1
                  const isActive = step === stepNum
                  const isPast = step > stepNum
                  return (
                    <div key={idx} className={`flex flex-col items-center gap-2 ${isActive || isPast ? 'text-deep' : 'text-mid/60'}`}>
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${isActive || isPast ? 'bg-deep text-white' : 'bg-surf border-2 border-line text-mid/60'}`}>
                        {isPast ? <CheckCircle2 size={14} /> : stepNum}
                      </div>
                      <span className="hidden sm:inline bg-surf px-1">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          
          <div className="animate-enter">
            {step === 1 && (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleNext} noValidate>
                <div className="sm:col-span-2 mb-4">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-deep">Create your account</h2>
                  <p className="mt-1 text-sm text-mid">Let's get started with your basic details.</p>
                </div>
                <div className="sm:col-span-2">
                  <TextField label="Full name" value={accountForm.fullName} onChange={(e) => { setAccountForm({ ...accountForm, fullName: e.target.value }); setFieldErrors(fe => ({ ...fe, fullName: undefined })) }} required placeholder="Enter your full name" />
                  {fieldErrors.fullName && <p className="mt-1 text-xs text-alert">{fieldErrors.fullName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <TextField label="Email address" type="email" value={accountForm.email} onChange={(e) => { setAccountForm({ ...accountForm, email: e.target.value }); setFieldErrors(fe => ({ ...fe, email: undefined })) }} autoComplete="email" required placeholder="you@example.com" />
                  {fieldErrors.email && <p className="mt-1 text-xs text-alert">{fieldErrors.email}</p>}
                </div>
                <div className="sm:col-span-2">
                  <PasswordField label="Password" minLength={8} value={accountForm.password} onChange={(e) => { setAccountForm({ ...accountForm, password: e.target.value }); setFieldErrors(fe => ({ ...fe, password: undefined })) }} hint="At least 8 characters" autoComplete="new-password" required placeholder="Create a strong password" />
                  {fieldErrors.password && <p className="mt-1 text-xs text-alert">{fieldErrors.password}</p>}
                </div>
                <div className="mt-4 sm:col-span-2">
                  <Button className="w-full flex items-center justify-center gap-2" type="submit">
                    Continue <ChevronRight size={18} />
                  </Button>
                  <p className="mt-4 text-center text-sm text-mid">
                    Already have an account? <Link to="/login" className="font-semibold text-focus hover:underline">Sign in</Link>
                  </p>
                </div>
              </form>
            )}

            {step === 2 && (
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleNext} noValidate>
                <div className="sm:col-span-2 mb-4">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-deep">Tell us about your first member</h2>
                  <p className="mt-1 text-sm text-mid">You can add more family members anytime.</p>
                </div>
                <div className="sm:col-span-2">
                  <TextField label="Name" value={memberForm.memberName} onChange={(e) => { setMemberForm({ ...memberForm, memberName: e.target.value }); setFieldErrors(fe => ({ ...fe, memberName: undefined })) }} required placeholder="Enter name (e.g., Aarav)" />
                  {fieldErrors.memberName && <p className="mt-1 text-xs text-alert">{fieldErrors.memberName}</p>}
                </div>
                <div className="sm:col-span-2">
                  <TextField label="Date of birth" type="date" value={memberForm.memberDob} onChange={(e) => { setMemberForm({ ...memberForm, memberDob: e.target.value }); setFieldErrors(fe => ({ ...fe, memberDob: undefined })) }} required />
                  {fieldErrors.memberDob && <p className="mt-1 text-xs text-alert">{fieldErrors.memberDob}</p>}
                </div>
                <div>
                  <SelectField label="Gender" value={memberForm.memberGender} onChange={(e) => setMemberForm({ ...memberForm, memberGender: e.target.value })} required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </SelectField>
                </div>
                <div>
                  <SelectField label="Relationship to you" value={memberForm.memberRelationship} onChange={(e) => setMemberForm({ ...memberForm, memberRelationship: e.target.value })} required>
                    <option value="Self">Self</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Other">Other</option>
                  </SelectField>
                </div>
                <div className="sm:col-span-2">
                  <SelectField label="Blood group (optional)" value={memberForm.memberBloodGroup} onChange={(e) => setMemberForm({ ...memberForm, memberBloodGroup: e.target.value })}>
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </SelectField>
                </div>
                
                <div className="mt-4 flex gap-4 sm:col-span-2">
                  <Button variant="secondary" className="flex items-center justify-center gap-2 px-6 flex-1 sm:flex-none" onClick={handleBack} type="button">
                    <ChevronLeft size={18} /> Back
                  </Button>
                  <Button className="flex-1 flex items-center justify-center gap-2" type="submit">
                    Continue <ChevronRight size={18} />
                  </Button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form className="flex flex-col items-center text-center" onSubmit={handleSubmit} noValidate>
                <div className="mb-6 w-full text-left">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-deep">Choose a profile photo</h2>
                  <p className="mt-1 text-sm text-mid">This helps make AarogyaKul feel more like your family.</p>
                </div>

                <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-norm border-2 border-dashed border-mid/30 overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className="h-8 w-8 text-mid/50" />
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                </div>
                
                <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()}>
                  {photoPreview ? 'Change Photo' : 'Upload a photo'}
                </Button>
                
                <div className="mt-12 flex w-full gap-4">
                  <Button variant="secondary" className="flex items-center justify-center gap-2 px-6 flex-1 sm:flex-none" onClick={handleBack} type="button" disabled={submitting}>
                    <ChevronLeft size={18} /> Back
                  </Button>
                  <Button className="flex-1 flex items-center justify-center gap-2" type="submit" disabled={submitting}>
                    {submitting ? 'Setting up...' : 'Complete Setup'} <ChevronRight size={18} />
                  </Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div className="flex flex-col items-center text-center py-8">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-pri/10 text-pri">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-deep">You're all set!</h2>
                <p className="mt-4 mb-8 text-base text-mid max-w-sm">
                  Welcome to AarogyaKul! Your account is ready and your first family member has been added. You're now ready to organize and take control of your family's health.
                </p>
                <Button className="w-full sm:w-auto px-8 py-3 text-base flex items-center justify-center gap-2" onClick={() => navigate('/app')}>
                  Go to Your Family <ChevronRight size={18} />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
