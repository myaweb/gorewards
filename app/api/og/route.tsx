import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get parameters from query params
    const title = searchParams.get('title') || 'GoRewards - Maximize Your Credit Card Rewards'
    const subtitle = searchParams.get('subtitle') || 'AI-Powered Credit Card Optimization'
    const type = searchParams.get('type') || 'default' // 'card', 'comparison', 'default'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#090A0F',
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(8, 145, 178, 0.1) 0%, transparent 50%)',
            padding: '80px',
          }}
        >
          {/* Logo/Brand Area */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '20px',
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  fill="#090A0F"
                  opacity="0.9"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="#090A0F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="#090A0F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </svg>
            </div>
            <span
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                letterSpacing: '-0.02em',
              }}
            >
              GoRewards
            </span>
          </div>

          {/* Main Title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '1000px',
            }}
          >
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                backgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1.2,
                marginBottom: '24px',
                letterSpacing: '-0.03em',
              }}
            >
              {title}
            </h1>
            
            <p
              style={{
                fontSize: '32px',
                color: '#9ca3af',
                lineHeight: 1.4,
                fontWeight: '300',
              }}
            >
              {subtitle}
            </p>
          </div>

          {/* Bottom Badge - Dynamic based on type */}
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              display: 'flex',
              alignItems: 'center',
              padding: '16px 32px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '2px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '999px',
            }}
          >
            {type === 'card' ? (
              <>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: '12px' }}
                >
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="#06b6d4" strokeWidth="2" fill="none" />
                  <path d="M2 10H22" stroke="#06b6d4" strokeWidth="2" />
                </svg>
                <span
                  style={{
                    fontSize: '20px',
                    color: '#06b6d4',
                    fontWeight: '600',
                  }}
                >
                  GoRewards Card Review
                </span>
              </>
            ) : type === 'comparison' ? (
              <>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: '12px' }}
                >
                  <path d="M9 18L15 12L9 6" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span
                  style={{
                    fontSize: '20px',
                    color: '#06b6d4',
                    fontWeight: '600',
                  }}
                >
                  AI-Powered Comparison
                </span>
              </>
            ) : (
              <>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ marginRight: '12px' }}
                >
                  <path
                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    fill="#06b6d4"
                  />
                </svg>
                <span
                  style={{
                    fontSize: '20px',
                    color: '#06b6d4',
                    fontWeight: '600',
                  }}
                >
                  AI-Powered Optimization
                </span>
              </>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}

