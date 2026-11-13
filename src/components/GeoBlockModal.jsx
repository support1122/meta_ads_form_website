import { useEffect } from 'react'
import { X, MapPin } from 'lucide-react'

export default function GeoBlockModal({ isVisible, onClose, region = 'the USA' }) {
  useEffect(() => {
    if (!isVisible) return
    const handleEscape = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative', background: '#fff', borderRadius: 16,
          maxWidth: 420, width: 'calc(100vw - 32px)', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          padding: '2rem 1.5rem', textAlign: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14, background: 'none',
            border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4,
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ background: '#ffedd5', borderRadius: '50%', padding: 12 }}>
            <MapPin size={32} color="#ea580c" />
          </div>
        </div>

        <h3 style={{ margin: '0 0 12px', fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
          Our services are currently limited to {region}.
        </h3>
        <p style={{ color: '#4b5563', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
          We are working hard to expand access worldwide. Stay tuned for updates
          on our global availability!
        </p>

        <div style={{
          background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8,
          padding: 12, marginBottom: 24,
        }}>
          <p style={{ color: '#9a3412', fontSize: '0.9rem', fontWeight: 500, margin: 0 }}>
            Coming soon to your country!
          </p>
        </div>

        <p style={{
          fontSize: '0.75rem', color: '#6b7280', borderTop: '1px solid #f3f4f6',
          paddingTop: 16, margin: 0,
        }}>
          For questions about our expansion, please contact our support team.
        </p>
      </div>
    </div>
  )
}
