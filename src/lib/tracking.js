import { API_BASE_URL } from './config'

const VISITOR_KEY = 'ff_visitor_id_v1'
const TRACKING_KEY = 'ff_tracking_v1'

// This whole app is the landing page for one campaign, so a visit with no utm_source
// (a direct or returning hit, or an ad link that dropped the param) is still a view of
// that campaign. Fall back to its canonical source so page views are never lost.
// Overridable per deployment if the page is ever reused for a different campaign.
const CAMPAIGN_UTM_SOURCE = import.meta.env.VITE_CAMPAIGN_UTM_SOURCE || 'meta_ads_form'

const PARAM_MAP = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_content: 'utmContent',
  utm_term: 'utmTerm',
  fbclid: 'fbclid',
  // Google Ads click ids, so a lead from Google can be traced to its campaign
  gclid: 'gclid',
  gbraid: 'gbraid',
  wbraid: 'wbraid',
  gad_campaignid: 'gadCampaignId',
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = generateId()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return generateId()
  }
}

// Persisted in localStorage (not sessionStorage) so ad attribution survives
// the visitor leaving and returning directly later. Last-touch wins: params
// on a newer visit overwrite the stored ones.
export function captureTrackingParams() {
  try {
    const params = new URLSearchParams(window.location.search)
    const found = {}
    for (const [param, key] of Object.entries(PARAM_MAP)) {
      const value = params.get(param)
      if (value) found[key] = value
    }
    if (Object.keys(found).length === 0) return

    const existing = JSON.parse(localStorage.getItem(TRACKING_KEY) || '{}')
    localStorage.setItem(TRACKING_KEY, JSON.stringify({ ...existing, ...found }))
  } catch {
    // ignore storage / parse errors
  }
}

// Records a campaign page view on the backend so the Campaign Manager's "Page Views"
// and "Unique Visitors" counters move. Hits the same public endpoint the register and
// main sites already use (POST /api/campaigns/track/visit); the backend resolves the
// campaign by utm_source and appends to its pageVisits, deduping unique visitors by id.
//
// Fire-and-forget and guarded so it can never block, throw into, or double-count a page
// load — the module flag makes it idempotent across React StrictMode's double-mount and
// any re-render.
let pageViewSent = false
export function trackPageView() {
  if (pageViewSent) return
  pageViewSent = true
  try {
    const utmSource = getTrackingData().utmSource || CAMPAIGN_UTM_SOURCE
    if (!utmSource) return
    fetch(`${API_BASE_URL}/api/campaigns/track/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Survive an immediate navigation away from the page.
      keepalive: true,
      body: JSON.stringify({
        utmSource,
        visitorId: getVisitorId(),
        userAgent: navigator.userAgent,
        ipAddress: null,
        referrer: document.referrer || null,
        pageUrl: window.location.href,
      }),
    }).catch(() => {
      // A failed view-count must never surface to the visitor.
    })
  } catch {
    // never let tracking break the page
  }
}

// Records a CTA click on the backend so the Campaign Manager's "Button Clicks" card
// moves. Same public endpoint the other sites use (POST /api/campaigns/track/button-click).
// Not guarded like the page view — a visitor can legitimately click several CTAs, and
// each is its own event. Fire-and-forget so it never blocks or breaks the click.
export function trackButtonClick(buttonText, buttonLocation, buttonType = 'cta') {
  try {
    const utmSource = getTrackingData().utmSource || CAMPAIGN_UTM_SOURCE
    if (!utmSource || !buttonText || !buttonLocation) return
    fetch(`${API_BASE_URL}/api/campaigns/track/button-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        utmSource,
        visitorId: getVisitorId(),
        buttonText,
        buttonLocation,
        buttonType,
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {})
  } catch {
    // never let tracking break the page
  }
}

function getCookie(name) {
  try {
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

export function getTrackingData() {
  let stored = {}
  try {
    stored = JSON.parse(localStorage.getItem(TRACKING_KEY) || '{}')
  } catch {
    stored = {}
  }
  return {
    utmSource: stored.utmSource || null,
    utmMedium: stored.utmMedium || null,
    utmCampaign: stored.utmCampaign || null,
    utmContent: stored.utmContent || null,
    utmTerm: stored.utmTerm || null,
    fbclid: stored.fbclid || null,
    gclid: stored.gclid || null,
    gbraid: stored.gbraid || null,
    wbraid: stored.wbraid || null,
    gadCampaignId: stored.gadCampaignId || null,
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc'),
  }
}
