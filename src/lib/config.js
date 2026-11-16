export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.flashfirejobs.com').replace(/\/+$/, '')

// Google Ads conversion "FlashFire UK - Lead Form Submission". It fires only after a
// successful lead submit on the UK page (see LeadWizard). Both values come from Google Ads →
// Goals → Conversions → Tag setup (conversion ID 18574720673, label after the "/").
export const GADS_CONVERSION_ID = import.meta.env.VITE_GADS_CONVERSION_ID || 'AW-18574720673'
export const GADS_CONVERSION_LABEL = import.meta.env.VITE_GADS_CONVERSION_LABEL || 'EvnwCLG4prkdEKH9jplF'
