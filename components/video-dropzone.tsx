'use client'

import { useRef, useState, DragEvent, ChangeEvent } from 'react'

interface VideoDropzoneProps {
  onFile: (file: File) => void
}

export function VideoDropzone({ onFile }: VideoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    onFile(file)
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('video/')) {
      handleFile(file)
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-10
        flex flex-col items-center justify-center gap-4 transition-all duration-200 select-none
        ${dragging
          ? 'border-orange-500 bg-orange-500/10'
          : 'border-[#2a2a3a] hover:border-orange-500/60 hover:bg-orange-500/5'
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={onChange}
      />

      <div className="text-5xl">🏀</div>

      {fileName ? (
        <div className="text-center">
          <p className="text-sm font-medium text-orange-400">{fileName}</p>
          <p className="text-xs text-gray-500 mt-1">Haz clic para cambiar el vídeo</p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-base font-semibold text-gray-200">
            Arrastra un vídeo aquí
          </p>
          <p className="text-sm text-gray-500 mt-1">
            o haz clic para seleccionar un archivo
          </p>
          <p className="text-xs text-gray-600 mt-3">Formatos: MP4, MOV, AVI, MKV…</p>
        </div>
      )}
    </div>
  )
}
