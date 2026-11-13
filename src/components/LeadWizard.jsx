import { useEffect, useRef, useState } from 'react'
import { API_BASE_URL } from '../lib/config'
import { getCachedCountryCode } from '../lib/countryDetection'
import { LOCALE_CONTENT } from '../lib/locale'
import { validatePhone, validateName, validateEmail, isCompleteUkPhone } from '../lib/validation'
import { getVisitorId, getTrackingData, trackButtonClick } from '../lib/tracking'

const TOTAL = 3
const BACKEND_LOCALE = 'us'

const STATUS_OPTIONS = [
  { value: 'F1/OPT (Student, USA)', ic: '🎓', label: 'F1 / OPT', sub: 'Student, USA' },
  { value: 'H1B / Work Visa (USA)', ic: '💼', label: 'H1B / Work Visa', sub: 'USA' },
  { value: 'PGWP (Canada)', ic: '🍁', label: 'PGWP', sub: 'Canada' },
  { value: 'Student Visa (UK)', ic: '🎓', label: 'Student Visa', sub: 'UK' },
  { value: 'Graduate Visa (UK)', ic: '📜', label: 'Graduate Visa', sub: 'UK' },
  { value: 'Skilled Worker Visa (UK)', ic: '💼', label: 'Skilled Worker Visa', sub: 'UK' },
  { value: 'Just exploring', ic: '🔍', label: 'Just', sub: 'Exploring' },
]

export default function LeadWizard({ locale, onOpenCalendly }) {
  const [step, setStep] = useState(1)
  const [status, setStatus] = useState('')
  const [statusErr, setStatusErr] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneErr, setPhoneErr] = useState('')
  const [name, setName] = useState('')
  const [nameErr, setNameErr] = useState('')
  const [email, setEmail] = useState('')
  const [emailErr, setEmailErr] = useState('')
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitErr, setSubmitErr] = useState('')
  const [honey, setHoney] = useState('')

  const submitRef = useRef(null)
  const lastSubmitKeyRef = useRef('')

  const progress = Math.round((step / TOTAL) * 100) + '%'

  // Auto-advance delays: a complete UK number is unambiguous, international
  // numbers vary in length so we wait a little longer for the user to finish.
  const PHONE_ADVANCE_UK_MS = 600
  const PHONE_ADVANCE_INTL_MS = 1500
  const SUBMIT_IDLE_MS = 1200

  function pickStatus(value) {
    setStatus(value)
    setStatusErr(false)
    setTimeout(() => setStep(s => (s === 1 ? 2 : s)), 250)
  }

  // Letters and other symbols are rejected as they are typed or pasted, with a
  // warning telling the user what to enter instead.
  function handlePhoneChange(e) {
    const raw = e.target.value
    const cleaned = raw.replace(/[^\d\s+().-]/g, '')
    setPhone(cleaned)
    setPhoneErr(
      cleaned !== raw
        ? 'Please type numbers only (e.g. 07700 900123 or +91 98173 49846). Letters are not allowed.'
        : ''
    )
  }

  function advanceFromPhone() {
    const err = validatePhone(phone)
    setPhoneErr(err)
    if (!err) setStep(3)
  }

  function back() {
    setSubmitErr('')
    setStep(s => Math.max(s - 1, 1))
  }

  // Step 2: move on by itself once the number is valid and typing has paused.
  useEffect(() => {
    if (step !== 2 || phoneErr || validatePhone(phone)) return
    const t = setTimeout(
      () => setStep(3),
      isCompleteUkPhone(phone) ? PHONE_ADVANCE_UK_MS : PHONE_ADVANCE_INTL_MS
    )
    return () => clearTimeout(t)
  }, [step, phone, phoneErr])

  // Enter key (the form has no buttons to click).
  function handleFormSubmit(e) {
    e.preventDefault()
    if (step === 2) advanceFromPhone()
    else if (step === 3) doSubmit()
  }

  async function doSubmit() {
    if (submitting || done) return
    lastSubmitKeyRef.current = `${name}|${email}`
    // Counts the submit itself; the resulting booking is a separate metric downstream.
    trackButtonClick('Submit (Lead Form)', 'lead_wizard')
    const nErr = validateName(name)
    const eErr = validateEmail(email)
    setNameErr(nErr)
    setEmailErr(eErr)
    if (nErr || eErr) return

    setSubmitting(true)
    setSubmitErr('')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    try {
      const res = await fetch(`${API_BASE_URL}/api/meta-ads-form/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name,
          email,
          phone,
          status,
          // The lead API only accepts 'us' or 'en-ca' for locale, so UK leads are
          // sent as 'us' and tagged with market 'uk'. The job type ("... (UK)")
          // is saved on the CRM lead, which is what tells UK leads apart there.
          locale: locale === 'en-gb' ? 'us' : locale,
          market: locale === 'en-gb' ? 'uk' : undefined,
          clientGeo: {
            countryCode: getCachedCountryCode(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language || null,
          },
          pageUrl: window.location.href,
          referrer: document.referrer || null,
          visitorId: getVisitorId(),
          ...getTrackingData(),
          _honey: honey,
        }),
      })
      clearTimeout(timer)
      const json = await res.json().catch(() => null)
      if (res.status === 400 && json?.errors && typeof json.errors === 'object') {
        const [field, message] = Object.entries(json.errors)[0] || []
        const msg = typeof message === 'string' && message
          ? message
          : 'Something went wrong. Please try again.'
        setSubmitting(false)
        if (field === 'phone') {
          setPhoneErr(msg)
          setStep(2)
        } else if (field === 'name') {
          setNameErr(msg)
          setStep(3)
        } else if (field === 'email') {
          setEmailErr(msg)
          setStep(3)
        } else if (field === 'status') {
          setSubmitErr(msg)
          setStep(1)
        } else {
          setSubmitErr(msg)
        }
        return
      }
      if (!res.ok || !json?.success) throw new Error('Lead submission failed')

      setDone(true)
      document.body.classList.add('done')
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Lead')
      }
      if (onOpenCalendly) onOpenCalendly({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() })
    } catch {
      setSubmitting(false)
      setSubmitErr('Something went wrong. Please try again.')
    } finally {
      clearTimeout(timer)
    }
  }

  // Step 3: submit by itself once name and email are valid and typing has paused.
  useEffect(() => { submitRef.current = doSubmit })
  useEffect(() => {
    if (step !== 3 || submitting || done || submitErr) return
    if (validateName(name) || validateEmail(email)) return
    if (lastSubmitKeyRef.current === `${name}|${email}`) return
    const t = setTimeout(() => submitRef.current?.(), SUBMIT_IDLE_MS)
    return () => clearTimeout(t)
  }, [step, name, email, submitting, done, submitErr])

  const { statusOrder, phonePlaceholder, phoneHint } = LOCALE_CONTENT[locale]
  const statusOptions = STATUS_OPTIONS.filter(o => statusOrder.includes(o.value)).sort((a, b) => {
    const ia = statusOrder.indexOf(a.value)
    const ib = statusOrder.indexOf(b.value)
    return (ia === -1 ? statusOrder.length : ia) - (ib === -1 ? statusOrder.length : ib)
  })

  return (
    <form className="card wiz-card" onSubmit={handleFormSubmit} noValidate>
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={honey}
        onChange={e => setHoney(e.target.value)}
        style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
      />
      {!done && (
        <>
          <div className="wiz-top">
            <div className="wiz-title">Book Your Free Strategy Call</div>
          </div>
          <div className="wiz-progress">
            <span className="wiz-progress-fill" style={{ width: progress }} />
          </div>
          {submitErr && (
            <div className="field-error" style={{ display: 'block', marginBottom: 10 }}>
              {submitErr}
            </div>
          )}
        </>
      )}

      {/* Step 1 */}
      {!done && step === 1 && (
        <div>
          <p className="wiz-q">What's your current status?</p>
          <div className="tile-grid" role="radiogroup" aria-label="Current status">
            {statusOptions.map(opt => (
              <label
                key={opt.value}
                className={'opt' + (status === opt.value ? ' picked' : '')}
              >
                <input
                  type="radio"
                  name="status"
                  value={opt.value}
                  checked={status === opt.value}
                  onChange={() => setStatus(opt.value)}
                  onClick={() => pickStatus(opt.value)}
                />
                <span className="ic">{opt.ic}</span>
                <span>{opt.label}<br /><small>{opt.sub}</small></span>
              </label>
            ))}
          </div>
          {statusErr && (
            <div className="field-error" style={{ display: 'block', marginBottom: 10 }}>
              Please select one option to continue.
            </div>
          )}
        </div>
      )}

      {/* Step 2 */}
      {!done && step === 2 && (
        <div>
          <p className="wiz-q">What's the best number to reach you on?</p>
          <div className={'field' + (phoneErr ? ' invalid' : '')} id="f-phone">
            <label htmlFor="phone">Phone / WhatsApp number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              autoComplete="tel"
              inputMode="tel"
              placeholder={phonePlaceholder}
              maxLength={32}
              value={phone}
              autoFocus
              onChange={handlePhoneChange}
              onBlur={() => { if (phone.trim()) advanceFromPhone() }}
            />
            <div className="field-error">{phoneErr || 'Please enter a valid phone number.'}</div>
          </div>
          <p className="fine" style={{ textAlign: 'left', margin: '0 0 12px' }}>
            {phoneHint}
          </p>
          <div className="wiz-nav">
            <button type="button" className="btn-back" onClick={back}>← Back</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {!done && step === 3 && (
        <div>
          <p className="wiz-q">Almost there — where should we send your plan?</p>
          <div className={'field' + (nameErr ? ' invalid' : '')} id="f-name">
            <label htmlFor="name">Full name</label>
            <input
              type="text"
              id="name"
              name="name"
              autoComplete="name"
              placeholder="e.g. Ananya Rao"
              maxLength={200}
              value={name}
              autoFocus
              onChange={e => { setName(e.target.value); setNameErr(''); setSubmitErr('') }}
              onBlur={() => { if (name.trim()) setNameErr(validateName(name)) }}
            />
            <div className="field-error">{nameErr || 'Please enter your full name.'}</div>
          </div>
          <div className={'field' + (emailErr ? ' invalid' : '')} id="f-email">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="you@email.com"
              maxLength={320}
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailErr(''); setSubmitErr('') }}
              onBlur={() => { if (email.trim()) setEmailErr(validateEmail(email)) }}
            />
            <div className="field-error">{emailErr || 'Please enter a valid email address.'}</div>
          </div>
          <div className="wiz-nav">
            <button type="button" className="btn-back" onClick={back}>← Back</button>
            {submitting && <span className="fine" style={{ margin: 0 }}>Submitting…</span>}
            {submitErr && !submitting && (
              <button type="button" className="submit-btn" onClick={doSubmit}>Try again</button>
            )}
          </div>
          <p className="fine">Your details are submitted automatically once complete. By submitting, you agree to be contacted by FlashFire about your job search.</p>
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="success active" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem', fontWeight: 700 }}>Successfully Submitted!</h3>
          <p style={{ color: '#666', margin: '0 auto', textAlign: 'center', whiteSpace: 'nowrap' }}>Your details have been received successfully.</p>
        </div>
      )}
    </form>
  )
}
