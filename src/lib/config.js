export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://api.flashfirejobs.com').replace(/\/+$/, '')

// Google Ads conversion for lead form submits. Set VITE_GADS_CONVERSION_LABEL to the label
// shown in Google Ads (Goals → Conversions → lead action → Tag setup, the part after "/").
export const GADS_CONVERSION_ID = import.meta.env.VITE_GADS_CONVERSION_ID || 'AW-18574720673'
export const GADS_CONVERSION_LABEL = import.meta.env.VITE_GADS_CONVERSION_LABEL || ''
