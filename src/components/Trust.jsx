const US_UNIVERSITIES = [
  { name: 'Harvard University', domain: 'harvard.edu', wordmark: ['HARVARD', 'UNIVERSITY'], color: '#a7a7a7' },
  { name: 'Stanford University', domain: 'stanford.edu', wordmark: ['Stanford', 'University'], color: '#8c1515' },
  { name: 'University of Michigan', domain: 'umich.edu', wordmark: ['UNIVERSITY OF', 'MICHIGAN'], color: '#00274c' },
  { name: 'Berkeley', domain: 'berkeley.edu', wordmark: ['Berkeley', 'UNIVERSITY OF CALIFORNIA'], color: '#003262' },
  { name: 'Carnegie Mellon University', domain: 'cmu.edu', wordmark: ['Carnegie', 'Mellon', 'University'], color: '#e1bfc4' },
]

const UK_UNIVERSITIES = [
  { name: 'University of Oxford', domain: 'ox.ac.uk', wordmark: ['UNIVERSITY OF', 'OXFORD'], color: '#002147' },
  { name: 'University of Cambridge', domain: 'cam.ac.uk', wordmark: ['UNIVERSITY OF', 'CAMBRIDGE'], color: '#5f8f78' },
  { name: 'Imperial College London', domain: 'imperial.ac.uk', wordmark: ['Imperial College', 'London'], color: '#003e74' },
  { name: 'UCL', domain: 'ucl.ac.uk', wordmark: ['UCL'], color: '#500778' },
  { name: 'University of Edinburgh', domain: 'www.ed.ac.uk', wordmark: ['UNIVERSITY OF', 'EDINBURGH'], color: '#041e42' },
]

const AU_UNIVERSITIES = [
  { name: 'University of Melbourne', domain: 'unimelb.edu.au', wordmark: ['THE UNIVERSITY OF', 'MELBOURNE'], color: '#094183' },
  { name: 'University of Sydney', domain: 'sydney.edu.au', wordmark: ['THE UNIVERSITY OF', 'SYDNEY'], color: '#e64626' },
  { name: 'Australian National University', domain: 'anu.edu.au', wordmark: ['ANU'], color: '#be830e' },
  { name: 'UNSW Sydney', domain: 'unsw.edu.au', wordmark: ['UNSW', 'SYDNEY'], color: '#000000' },
  { name: 'Monash University', domain: 'monash.edu', wordmark: ['MONASH', 'University'], color: '#006dae' },
]

function getLogoUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
}

function getUsLineStyle(name, index) {
  if (name === 'Berkeley' && index === 1) {
    return { fontSize: '8px', fontWeight: 700, lineHeight: 1, letterSpacing: '0.02em' }
  }
  if (name === 'University of Michigan' && index === 0) {
    return { fontSize: '9px', fontWeight: 700, lineHeight: 1, letterSpacing: '0.03em' }
  }
  return { fontSize: '17px', fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.02em' }
}

function getUkLineStyle(name, index, line) {
  if (line === 'UNIVERSITY OF' || line === 'THE UNIVERSITY OF') {
    return { fontSize: '11px', fontWeight: 700, lineHeight: 1, letterSpacing: '0.03em' }
  }
  return { fontSize: '22px', fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.02em' }
}

const LAYOUTS = {
  au: {
    universities: AU_UNIVERSITIES,
    lineStyle: getUkLineStyle,
    logo: 44,
    gap: '10px',
    grid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '32px 56px', margin: '0 auto' },
  },
  us: {
    universities: US_UNIVERSITIES,
    lineStyle: getUsLineStyle,
    logo: 36,
    gap: '10px',
    grid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'center', gap: '24px 28px', margin: '0 auto' },
  },
  uk: {
    universities: UK_UNIVERSITIES,
    lineStyle: getUkLineStyle,
    logo: 44,
    gap: '10px',
    grid: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '32px 72px', margin: '0 auto' },
  },
}

export default function Trust({ locale = 'us', heading }) {
  const layout = locale === 'en-au' ? LAYOUTS.au : locale === 'en-gb' ? LAYOUTS.uk : LAYOUTS.us
  return (
    <section style={{ padding: '36px 24px', textAlign: 'center', background: '#fff' }}>
      <p style={{
        fontSize: '20px', fontWeight: 500, color: '#9d9d9d',
        marginBottom: '28px', lineHeight: 1.4,
      }}>
        {heading}
      </p>

      <div style={layout.grid}>
        {layout.universities.map(u => (
          <div
            key={u.name}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: layout.gap, color: u.color, opacity: 0.9, whiteSpace: 'nowrap',
            }}
          >
            <img
              src={getLogoUrl(u.domain)}
              alt=""
              onError={e => { e.currentTarget.style.display = 'none' }}
              width={layout.logo}
              height={layout.logo}
              style={{ width: layout.logo, height: layout.logo, objectFit: 'contain', opacity: 0.9 }}
            />
            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontFamily: 'Georgia, serif' }}>
              {u.wordmark.map((line, i) => (
                <span key={line} style={layout.lineStyle(u.name, i, line)}>
                  {line}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
