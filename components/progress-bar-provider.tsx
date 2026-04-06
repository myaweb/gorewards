'use client'

import NextTopLoader from 'nextjs-toploader'

export function ProgressBarProvider() {
  return (
    <NextTopLoader
      color="#06b6d4"
      initialPosition={0.08}
      crawlSpeed={200}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={200}
      shadow="0 0 10px #06b6d4,0 0 5px #06b6d4"
    />
  )
}
