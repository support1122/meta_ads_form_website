import { useEffect, useRef, useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Trust from './components/Trust'
import HowItWorks from './components/HowItWorks'
import Tiles from './components/Tiles'
import Testimonials from './components/Testimonials'
import Employers from './components/Employers'
import Founder from './components/Founder'
import Footer from './components/Footer'
import CalendlyModal from './components/CalendlyModal'
import GeoBlockModal from './components/GeoBlockModal'
import { getLocaleFromPath, LOCALE_CONTENT } from './lib/locale'
import { captureTrackingParams, trackPageView } from './lib/tracking'
import { detectIndiaBlock, isIndiaClientHeuristic, isGeoBypassed, grantGeoBypass } from './lib/geoBlock'
import { useGeoBypass } from './lib/useGeoBypass'

export default function App() {
  const [showCalendly, setShowCalendly] = useState(false)
  const [calendlyLead, setCalendlyLead] = useState(null)
  const [locale] = useState(() => getLocaleFromPath(window.location.pathname))
  const [isIndiaBlocked, setIsIndiaBlocked] = useState(false)
  const [geoBypassed, setGeoBypassed] = useState(() => isGeoBypassed())
  const [showGeoBlock, setShowGeoBlock] = useState(false)

  // Single shared India-detection promise so a click can await the IP lookup
  // instead of racing it.
  const indiaPromiseRef = useRef(null)
  function getIndiaBlockPromise() {
    if (!indiaPromiseRef.current) indiaPromiseRef.current = detectIndiaBlock()
    return indiaPromiseRef.current
  }

  // Nav/Hero buttons pass a click event; only the wizard passes lead data.
  // Prefilling Calendly with the submitted email is what lets the backend
  // webhook match the booking back to the meta lead and flip it to scheduled.
  async function openCalendly(lead) {
    if (lead && typeof lead === 'object' && typeof lead.email === 'string') {
      setCalendlyLead(lead)
    }
    if (geoBypassed) {
      setShowCalendly(true)
      return
    }
    // India geo-block: never open Calendly for Indian visitors unless the
    // 5-second hold bypass was used this session. The state check catches the
    // common case instantly; awaiting the shared promise closes the race for
    // Indian IPs whose device locale/timezone is not Indian (the IP lookup
    // may still be in flight on a fast first click).
    let blocked = isIndiaBlocked || isIndiaClientHeuristic()
    if (!blocked) {
      try {
        blocked = await getIndiaBlockPromise()
      } catch {
        blocked = false
      }
    }
    if (blocked) {
      setIsIndiaBlocked(true)
      setShowGeoBlock(true)
      return
    }
    setShowCalendly(true)
  }

  // Holding a CTA for 5 seconds bypasses the block and opens Calendly
  // (same behavior as the Next.js site's useGeoBypass on its CTAs).
  const { getButtonProps } = useGeoBypass({
    onBypass: () => {
      grantGeoBypass()
      setGeoBypassed(true)
      setShowGeoBlock(false)
      setShowCalendly(true)
    },
  })
  const geoHoldProps = isIndiaBlocked && !geoBypassed ? getButtonProps() : {}

  useEffect(() => {
    getIndiaBlockPromise().then(setIsIndiaBlocked)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Order matters: persist this visit's utm_source first, then read it back to
    // attribute the page view.
    captureTrackingParams()
    trackPageView()
  }, [])

  useEffect(() => {
    document.title = LOCALE_CONTENT[locale].title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', LOCALE_CONTENT[locale].description)
  }, [locale])

  const content = LOCALE_CONTENT[locale]

  return (
    <>
      <Nav onOpenCalendly={openCalendly} geoHoldProps={geoHoldProps} />
      <Hero locale={locale} onOpenCalendly={openCalendly} geoHoldProps={geoHoldProps} />
      <Trust locale={locale} heading={content.universitiesHeading} />
      <HowItWorks market={content.market} />
      <Tiles />
      <Testimonials />
      <Employers market={content.market} />
      <Founder />
      <Footer content={content.footer} />
      <CalendlyModal isVisible={showCalendly} lead={calendlyLead} onClose={() => setShowCalendly(false)} />
      <GeoBlockModal isVisible={showGeoBlock} onClose={() => setShowGeoBlock(false)} region={content.geoBlockRegion} />
    </>
  )
}
