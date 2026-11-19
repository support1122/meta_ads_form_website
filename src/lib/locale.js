// Locales: 'us' (default), 'en-ca' (/en-ca), 'en-gb' (/uk and /en-gb) and 'en-au' (/au and /en-au).
export function getLocaleFromPath(pathname) {
  if (pathname === '/en-ca' || pathname.startsWith('/en-ca/')) return 'en-ca'
  if (['/au', '/en-au'].some(p => pathname === p || pathname.startsWith(p + '/'))) return 'en-au'
  if (['/uk', '/en-gb'].some(p => pathname === p || pathname.startsWith(p + '/'))) return 'en-gb'
  return 'us'
}

// The market the CRM files a lead under: 'us', 'ca', 'uk' or 'au'. Sent with every form submission together with the
// route (for example '/uk'), so the team can tell which page a lead came from.
export function marketForLocale(locale) {
  if (locale === 'en-au') return 'au'
  if (locale === 'en-gb') return 'uk'
  if (locale === 'en-ca') return 'ca'
  return 'us'
}

const HERO_US = {
  badge: 'Interviews in as little as 1 week',
  line1: 'Land a Sponsored US Job',
  line2: 'in 90 Days with',
  highlight: 'FlashFire!',
}

const FOOTER_US = {
  heading: 'Start Your Job Search with FlashFire',
  sub: 'Get expert guidance from our team and let us apply to hundreds of targeted roles on your behalf while you focus on winning the interview.',
}

export const LOCALE_CONTENT = {
  'en-au': {
    title: 'FlashFire Jobs — Land a Sponsored Australian Job in 90 Days',
    description: "FlashFire's team tailors and submits up to 1,200 targeted Australian job applications on your behalf. Book your free career strategy call.",
    sub: 'Share your details and discover how our team can help you land more interviews by applying to 1,200 targeted Australian jobs on your behalf.',
    hero: {
      badge: 'Interviews in as little as 1 week',
      line1: 'Land a Sponsored Australian Job',
      line2: 'in 90 Days with',
      highlight: 'FlashFire!',
    },
    footer: {
      heading: 'Start Your Australian Job Search with FlashFire',
      sub: 'Get expert guidance from our team and let us apply to hundreds of targeted roles across Sydney, Melbourne, Brisbane, Perth and beyond while you focus on winning the interview.',
    },
    market: 'Australia',
    marketPhrase: 'across Australia',
    geoBlockRegion: 'Australia',
    universitiesHeading: 'Trusted by students and graduates from top Australian universities.',
    phonePlaceholder: '+61 412 345 678',
    phoneHint: 'Numbers only. Include your country code if outside Australia. We\u2019ll move on automatically.',
    statusOrder: [
      'Student Visa (Australia)',
      'Graduate Visa (Australia)',
      'Employer Sponsored Visa (Australia)',
      'Just exploring',
    ],
  },
  us: {
    title: 'FlashFire Jobs — Land a Sponsored US Job in 90 Days',
    description: "FlashFire's team tailors and submits up to 1,200 targeted US job applications on your behalf. Get your free career strategy call.",
    sub: 'Share your details and discover how our team can help you land more interviews by applying to 1,200 targeted US jobs on your behalf.',
    hero: HERO_US,
    footer: FOOTER_US,
    market: 'U.S.',
    geoBlockRegion: 'the USA',
    universitiesHeading: 'Trusted by students and graduates from top global universities.',
    phonePlaceholder: '+1 555 555 5555',
    phoneHint: 'Numbers only. Include your country code if outside the US. We\u2019ll move on automatically.',
    statusOrder: [
      'F1/OPT (Student, USA)',
      'H1B / Work Visa (USA)',
      'PGWP (Canada)',
      'Just exploring',
    ],
  },
  'en-ca': {
    title: 'FlashFire Jobs — Land Interview Calls Faster With Your AI Copilot (Canada)',
    description: "FlashFire's AI Copilot tailors and submits up to 1,200 US & Canada job applications for you. Get your free career strategy call.",
    sub: 'We apply to 1200 US & Canada job applications and track everything while you focus on winning the interview.',
    hero: HERO_US,
    footer: FOOTER_US,
    market: 'U.S.',
    geoBlockRegion: 'the USA and Canada',
    universitiesHeading: 'Trusted by students and graduates from top global universities.',
    phonePlaceholder: '+1 555 555 5555',
    phoneHint: 'Numbers only. Include your country code if outside Canada. We\u2019ll move on automatically.',
    statusOrder: [
      'PGWP (Canada)',
      'F1/OPT (Student, USA)',
      'H1B / Work Visa (USA)',
      'Just exploring',
    ],
  },
  'en-gb': {
    title: 'FlashFire Jobs — Land a Sponsored UK Job in 90 Days',
    description: "FlashFire's team tailors and submits up to 1,200 targeted UK job applications on your behalf. Get your free career strategy call.",
    sub: 'Share your details and discover how our team can help you land more interviews by applying to 1,200 targeted UK jobs on your behalf.',
    hero: {
      badge: 'Interviews in as little as 1 week',
      line1: 'Land a Sponsored UK Job',
      line2: 'in 90 Days with',
      highlight: 'FlashFire!',
    },
    footer: {
      heading: 'Start Your UK Job Search with FlashFire',
      sub: 'Get expert guidance from our team and let us apply to hundreds of targeted UK roles on your behalf while you focus on winning the interview.',
    },
    market: 'UK',
    geoBlockRegion: 'the UK',
    universitiesHeading: 'Trusted by students and graduates from top UK universities.',
    phonePlaceholder: '+44 7700 900123',
    phoneHint: 'Numbers only. Include your country code if outside the UK. We\u2019ll move on automatically.',
    statusOrder: [
      'Student Visa (UK)',
      'Graduate Visa (UK)',
      'Skilled Worker Visa (UK)',
      'Just exploring',
    ],
  },
}
