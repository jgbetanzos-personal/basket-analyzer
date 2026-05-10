'use client'

import { useState } from 'react'
import { VideoDropzone } from '@/components/video-dropzone'
import { VideoPlayer } from '@/components/video-player'
import { PlaysTimeline } from '@/components/plays-timeline'
import { uploadVideo } from '@/lib/upload-video'
import type { Evento } from '@/lib/types'

type Status = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [eventos, setEventos] = useState<Evento[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function handleAnalizar() {
    if (!file) return

    setStatus('uploading')
    setUploadProgress(0)
    setErrorMsg(null)
    setEventos([])

    try {
      const { fileUri, mimeType } = await uploadVideo(file, (pct) => {
        setUploadProgress(pct)
      })

      setStatus('analyzing')

      const res = await fetch('/api/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUri, mimeType }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `Server error ${res.status}`)
      }

      const data = await res.json()
      setEventos((data as { eventos: Evento[] }).eventos ?? [])
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error desconocido')
      setStatus('error')
    }
  }

  function handleReset() {
    setFile(null)
    setStatus('idle')
    setUploadProgress(0)
    setEventos([])
    setErrorMsg(null)
  }

  const isLoading = status === 'uploading' || status === 'analyzing'

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-[#e2e8f0]">
      {/* Header */}
      <header className="border-b border-[#2a2a3a] bg-[#13131a]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-3xl">🏀</span>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Basket Analyzer
            </h1>
            <p className="text-xs text-gray-500">Análisis de partidos con Gemini AI</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Upload + Video + Actions */}
          <div className="flex flex-col gap-5">
            {/* Dropzone */}
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                Vídeo del partido
              </h2>
              <VideoDropzone onFile={setFile} />
            </section>

            {/* Video preview */}
            {file && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Vista previa
                </h2>
                <VideoPlayer file={file} />
              </section>
            )}

            {/* Action buttons */}
            {file && (
              <div className="flex flex-col gap-3">
                {/* Progress bar */}
                {status === 'uploading' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Subiendo vídeo a Gemini…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-2 bg-[#2a2a3a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Analyzing indicator */}
                {status === 'analyzing' && (
                  <div className="flex items-center gap-3 bg-[#13131a] border border-[#2a2a3a] rounded-xl px-4 py-3">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-200">Analizando partido…</p>
                      <p className="text-xs text-gray-500">Gemini está procesando el vídeo. Puede tardar varios minutos.</p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {status === 'error' && errorMsg && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <p className="text-sm font-semibold text-red-400 mb-0.5">Error</p>
                    <p className="text-xs text-red-300">{errorMsg}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleAnalizar}
                    disabled={isLoading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed
                      text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-150 text-sm"
                  >
                    {isLoading ? 'Procesando…' : '▶ Analizar partido'}
                  </button>

                  {(status === 'done' || status === 'error') && (
                    <button
                      onClick={handleReset}
                      className="bg-[#13131a] hover:bg-[#1e1e2a] border border-[#2a2a3a] hover:border-orange-500/40
                        text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors duration-150 text-sm"
                    >
                      Nuevo
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Empty state guide */}
            {!file && (
              <div className="bg-[#13131a] border border-[#2a2a3a] rounded-xl p-4 text-xs text-gray-500 leading-relaxed space-y-1">
                <p className="font-semibold text-gray-400">Cómo funciona:</p>
                <p>1. Selecciona o arrastra un vídeo del partido</p>
                <p>2. Pulsa <span className="text-orange-400 font-medium">Analizar partido</span></p>
                <p>3. El vídeo se sube directamente a Gemini AI (sin límite de tamaño)</p>
                <p>4. Se detectan automáticamente los eventos: canastas, rebotes, asistencias…</p>
              </div>
            )}
          </div>

          {/* Right column: Timeline */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                Eventos detectados
              </h2>
              {eventos.length > 0 && (
                <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-medium">
                  {eventos.length} eventos
                </span>
              )}
            </div>

            <div className="bg-[#13131a] border border-[#2a2a3a] rounded-2xl p-5 min-h-96">
              {status === 'idle' && !file && (
                <div className="flex flex-col items-center justify-center h-80 gap-3 text-gray-600">
                  <span className="text-5xl opacity-30">📋</span>
                  <p className="text-sm">Los eventos aparecerán aquí</p>
                </div>
              )}

              {status === 'idle' && file && (
                <div className="flex flex-col items-center justify-center h-80 gap-3 text-gray-600">
                  <span className="text-5xl opacity-30">▶</span>
                  <p className="text-sm">Pulsa «Analizar partido» para empezar</p>
                </div>
              )}

              {(status === 'uploading' || status === 'analyzing') && (
                <div className="flex flex-col items-center justify-center h-80 gap-4">
                  <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-sm text-gray-300 font-medium">
                      {status === 'uploading' ? 'Subiendo vídeo…' : 'Analizando con IA…'}
                    </p>
                    {status === 'analyzing' && (
                      <p className="text-xs text-gray-600 mt-1">
                        Esto puede tardar entre 1 y 5 minutos según la duración del vídeo
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(status === 'done' || status === 'error') && (
                <PlaysTimeline eventos={eventos} />
              )}
            </div>

            {/* Stats summary */}
            {status === 'done' && eventos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Local"
                  value={eventos.filter(e => e.equipo === 'local').length}
                  sub="eventos"
                  color="blue"
                />
                <StatCard
                  label="Visitante"
                  value={eventos.filter(e => e.equipo === 'visitante').length}
                  sub="eventos"
                  color="red"
                />
                <StatCard
                  label="Canastas"
                  value={eventos.filter(e => e.tipo === 'canasta_2pts' || e.tipo === 'canasta_3pts').length}
                  sub="anotaciones"
                  color="orange"
                />
                <StatCard
                  label="Rebotes"
                  value={eventos.filter(e => e.tipo === 'rebote_ofensivo' || e.tipo === 'rebote_defensivo').length}
                  sub="totales"
                  color="green"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: number
  sub: string
  color: 'blue' | 'red' | 'orange' | 'green'
}) {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
  }

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold mt-0.5">{label}</p>
      <p className="text-xs opacity-60">{sub}</p>
    </div>
  )
}
