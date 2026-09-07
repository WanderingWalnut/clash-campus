import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const runtime = 'nodejs'

const DEFAULT_WIDTH = 2400
const DEFAULT_HEIGHT = 900
const MIN_WIDTH = 600
const MAX_WIDTH = 4000
const MIN_HEIGHT = 300
const MAX_HEIGHT = 2400

function parseDimension(
  value: string | null,
  fallback: number,
  min: number,
  max: number
) {
  if (!value) {
    return fallback
  }

  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) {
    return fallback
  }

  return Math.min(Math.max(parsed, min), max)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const width = parseDimension(
    searchParams.get('w'),
    DEFAULT_WIDTH,
    MIN_WIDTH,
    MAX_WIDTH
  )
  const height = parseDimension(
    searchParams.get('h'),
    DEFAULT_HEIGHT,
    MIN_HEIGHT,
    MAX_HEIGHT
  )

  const clashBold = await readFile(
    join(process.cwd(), 'public/assets/fonts/Clash_Bold.otf')
  )

  const iconSize = Math.max(Math.round(height * 0.28), 96)
  const textSize = Math.max(Math.round(height * 0.18), 72)
  const gap = Math.max(Math.round(height * 0.03), 18)
  const taglineSize = Math.max(Math.round(height * 0.06), 24)
  const textBlockGap = Math.max(Math.round(height * 0.018), 10)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap,
          background: 'rgba(0, 0, 0, 0)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap,
          }}
        >
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFD700"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
            <path d="M5 21h14" />
          </svg>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: textBlockGap,
            }}
          >
            <div
              style={{
                fontFamily: 'Clash',
                fontSize: textSize,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'baseline',
                lineHeight: 1,
              }}
            >
              <span>CLASH</span>
              <span style={{ color: '#003DA5' }}>CAMPUS</span>
            </div>

            <div
              style={{
                fontFamily: 'Clash',
                fontSize: taglineSize,
                fontWeight: 400,
                color: '#FFFFFF',
                lineHeight: 1.15,
                textAlign: 'center',
                opacity: 0.9,
              }}
            >
              Every campus has a king (or queen)
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        {
          name: 'Clash',
          data: clashBold,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
