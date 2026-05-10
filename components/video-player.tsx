'use client'

import { useEffect, useRef } from 'react'

interface VideoPlayerProps {
  file: File
}

export function VideoPlayer({ file }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!videoRef.current) return
    const url = URL.createObjectURL(file)
    videoRef.current.src = url
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className="rounded-xl overflow-hidden bg-black border border-[#2a2a3a]">
      <video
        ref={videoRef}
        controls
        className="w-full max-h-72 object-contain"
        playsInline
      />
    </div>
  )
}
