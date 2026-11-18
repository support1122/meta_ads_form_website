import { useState, useEffect } from 'react'
import { InlineWidget, useCalendlyEventListener } from 'react-calendly'
import { X, Calendar, CheckCircle } from 'lucide-react'
import { getTrackingData } from '../lib/tracking'
import { getLocaleFromPath, marketForLocale } from '../lib/locale'

const CALENDLY_URL = 'https://calendly.com/feedback-flashfire/15min'

function buildCalendlyUrl() {
  const tracking = getTrackingData()
  const params = new URLSearchParams()
  const fromGoogle = tracking.gclid || tracking.gbraid || tracking.wbraid
  params.set('utm_source', tracking.utmSource || (fromGoogle ? 'google' : 'meta_ads_form'))
  params.set('utm_medium', tracking.utmMedium || 'paid')
  if (tracking.utmCampaign) params.set('utm_campaign', tracking.utmCampaign)
  // Hidden route tag. Calendly hands utm_content back on the booking, so a booking made without the lead form
  // still says which page it came from. An ad's own utm_content is never overwritten.
  const market = marketForLocale(getLocaleFromPath(window.location.pathname))
  params.set('utm_content', tracking.utmContent || `route-${market}`)
  if (tracking.utmTerm) params.set('utm_term', tracking.utmTerm)
  return `${CALENDLY_URL}?${params.toString()}`
}

export default function CalendlyModal({ isVisible, lead, onClose }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isVisible) return
    const check = () => {
      const iframe = document.querySelector('iframe[src*="calendly.com"]')
      if (iframe) setIsReady(true)
    }
    const observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isVisible])

  useCalendlyEventListener({
    onEventScheduled: () => {
      onClose()
    }
  })

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative', background: '#fff', borderRadius: 16,
          maxWidth: 960, width: '95vw', maxHeight: '92vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'row', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 20,
            background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <X size={20} color="#555" />
        </button>

        {/* Left info panel — desktop only */}
        <div style={{
          width: '40%', background: 'linear-gradient(135deg, #ff5a18, #c0310a)',
          padding: '2.5rem 2rem', color: '#fff', display: 'flex', flexDirection: 'column',
          borderRadius: '16px 0 0 16px', overflowY: 'auto',
        }} className="cal-left-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10 }}>
              <Calendar size={28} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Schedule Your Flashfire Consultation</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>15 Minutes • Free</p>
            </div>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 24 }}>
            Book your personalized consultation to learn how Flashfire can automate your job search and land interviews faster.
          </p>

          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem' }}>What You'll Get:</h3>
          {[
            { title: 'Personalized Strategy', sub: 'Custom job search plan tailored to your goals' },
            { title: 'Resume Review', sub: 'Expert feedback on your current resume' },
            { title: 'AI Demo', sub: 'See our automation technology in action' },
            { title: 'Q&A Session', sub: 'Get all your questions answered by experts' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <CheckCircle size={20} color="#86efac" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)' }}>{item.sub}</div>
              </div>
            </div>
          ))}

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 20, marginTop: 'auto', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', textAlign: 'center', gap: 8 }}>
            {[['95%','Success Rate'],['100+','Jobs Landed'],['220+','Hours Saved']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{val}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Calendly widget */}
        <div style={{ flex: 1, position: 'relative', background: '#fff', borderRadius: '0 16px 16px 0', overflow: 'hidden' }}>
          {!isReady && (
            <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: '#999', fontSize: '0.9rem' }}>Loading calendar…</div>
            </div>
          )}
          <InlineWidget
            url={buildCalendlyUrl()}
            prefill={{
              name: lead?.name || '',
              email: lead?.email || '',
              // a3 mirrors the other Flashfire sites, where phone is the 3rd
              // invitee question; Calendly ignores the key if it differs here.
              ...(lead?.phone ? { customAnswers: { a3: lead.phone } } : {}),
            }}
            styles={{ height: '92vh', width: '100%' }}
          />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cal-left-panel { display: none !important; }
        }
      `}</style>
    </div>
  )
}
