import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Inclusia – Ofertas de trabajo sector social'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '16px',
            background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '36px' }}>I</span>
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '52px' }}>Inclusia</span>
        </div>

        {/* Title */}
        <div style={{
          color: 'white', fontSize: '44px', fontWeight: 700,
          textAlign: 'center', lineHeight: 1.2, marginBottom: '24px', maxWidth: '900px',
        }}>
          Ofertas de trabajo en sector social y apoyo educativo
        </div>

        {/* Subtitle */}
        <div style={{
          color: 'rgba(255,255,255,0.85)', fontSize: '26px',
          textAlign: 'center', maxWidth: '800px', lineHeight: 1.4,
        }}>
          PATI · Logopeda · Integrador Social · Educador Social · Terapeuta Ocupacional
        </div>

        {/* URL */}
        <div style={{
          marginTop: '48px', color: 'rgba(255,255,255,0.6)',
          fontSize: '22px', fontWeight: 500,
        }}>
          inclusiajobs.com
        </div>
      </div>
    ),
    { ...size }
  )
}
