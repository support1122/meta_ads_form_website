// Form validation for the lead wizard. Each validator returns an error
// message string, or '' when the value is acceptable.

// Phone/WhatsApp numbers: any country and any format, but digits only
// (plus an optional leading + and common separators).
export function validatePhone(raw) {
  const s = (raw || '').trim()
  if (!s) return 'Please enter your phone number.'
  if (s.length > 32) return 'Phone number must be at most 32 characters.'
  // Digits plus the usual separators only: no letters or other symbols.
  if (!/^\+?[\d\s().-]+$/.test(s)) return 'Please type numbers only (e.g. 07700 900123 or +91 98173 49846). Letters are not allowed.'
  const digits = s.replace(/\D/g, '').length
  if (digits < 7 || digits > 15) return 'Please enter a valid phone number (7–15 digits).'
  return ''
}

// True for a fully typed UK number, used to advance faster than for other
// countries (whose length we can't know).
export function isCompleteUkPhone(raw) {
  let t = (raw || '').replace(/\(0\)/g, '').replace(/[\s().-]/g, '')
  if (t.startsWith('0044')) t = '+44' + t.slice(4)
  const rest = t.startsWith('+44') ? t.slice(3) : t.startsWith('0') ? t.slice(1) : ''
  const n = rest.replace(/^0/, '')
  return /^7\d{9}$/.test(n) || /^[123]\d{9}$/.test(n)
}

export function validateName(raw) {
  const s = (raw || '').trim()
  if (s.length < 2) return 'Please enter your full name.'
  if (s.length > 200) return 'Name must be at most 200 characters.'
  if (!/\p{L}{2,}/u.test(s)) return 'Please enter your real name.'
  if (/\d/.test(s)) return 'Name should not contain numbers.'
  if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u.test(s)) return 'Name contains invalid characters.'
  return ''
}

const DOMAIN_TYPOS = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'yaho.com': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'outlok.com': 'outlook.com',
  'outlook.con': 'outlook.com',
  'iclod.com': 'icloud.com',
  'icloud.con': 'icloud.com',
}

export function validateEmail(raw) {
  const s = (raw || '').trim()
  if (!s) return 'Please enter your email address.'
  if (s.length > 320) return 'Email must be at most 320 characters.'
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(s) || s.includes('..')) {
    return 'Please enter a valid email address.'
  }
  const domain = s.split('@')[1].toLowerCase()
  if (DOMAIN_TYPOS[domain]) return `Did you mean ${s.split('@')[0]}@${DOMAIN_TYPOS[domain]}?`
  return ''
}

// True for a fully typed Australian number (mobile 04xx xxx xxx or a landline
// 0[2378] xxxx xxxx), with or without +61 / 0061.
export function isCompleteAuPhone(raw) {
  let t = (raw || '').replace(/\(0\)/g, '').replace(/[\s().-]/g, '')
  if (t.startsWith('0061')) t = '+61' + t.slice(4)
  const rest = t.startsWith('+61') ? t.slice(3) : t.startsWith('0') ? t.slice(1) : ''
  const n = rest.replace(/^0/, '')
  return /^4\d{8}$/.test(n) || /^[2378]\d{8}$/.test(n)
}
