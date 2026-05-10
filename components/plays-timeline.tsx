'use client'

import type { Evento, PlayType } from '@/lib/types'

const EMOJI: Record<PlayType, string> = {
  canasta_2pts: '🏀',
  canasta_3pts: '🎯',
  tiro_libre_anotado: '✅',
  tiro_libre_fallado: '❌',
  rebote_ofensivo: '💪',
  rebote_defensivo: '💪',
  asistencia: '🤝',
  tapon: '🛡️',
  robo: '⚡',
  falta: '🚨',
  perdida: '😬',
}

const LABEL: Record<PlayType, string> = {
  canasta_2pts: '2 puntos',
  canasta_3pts: '3 puntos',
  tiro_libre_anotado: 'Libre anotado',
  tiro_libre_fallado: 'Libre fallado',
  rebote_ofensivo: 'Reb. ofensivo',
  rebote_defensivo: 'Reb. defensivo',
  asistencia: 'Asistencia',
  tapon: 'Tapón',
  robo: 'Robo',
  falta: 'Falta',
  perdida: 'Pérdida',
}

interface PlaysTimelineProps {
  eventos: Evento[]
}

export function PlaysTimeline({ eventos }: PlaysTimelineProps) {
  if (eventos.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-4xl mb-3">📋</p>
        <p>No se detectaron eventos</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* vertical line */}
      <div className="absolute left-[3.25rem] top-0 bottom-0 w-px bg-[#2a2a3a]" />

      <div className="flex flex-col gap-1">
        {eventos.map((ev, i) => (
          <div key={i} className="flex items-start gap-4">
            {/* Time badge */}
            <div className="flex-shrink-0 w-24 text-right">
              <span className="inline-block bg-[#13131a] border border-[#2a2a3a] rounded-md px-2 py-0.5 text-xs font-mono text-orange-400">
                {ev.tiempo}
              </span>
            </div>

            {/* Dot on the line */}
            <div className="relative flex-shrink-0 mt-1">
              <div className="w-3 h-3 rounded-full border-2 border-orange-500 bg-[#0a0a0f] z-10 relative" />
            </div>

            {/* Event card */}
            <div className="flex-1 mb-4 bg-[#13131a] border border-[#2a2a3a] rounded-xl p-3 hover:border-orange-500/40 transition-colors">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl">{EMOJI[ev.tipo] ?? '•'}</span>
                <span className="text-sm font-semibold text-gray-100">
                  {LABEL[ev.tipo] ?? ev.tipo}
                </span>
                <span
                  className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                    ev.equipo === 'local'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {ev.equipo === 'local' ? 'Local' : 'Visitante'}
                </span>
              </div>

              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xs text-orange-400 font-medium">
                  #{ev.jugador}
                </span>
                <span className="text-xs text-gray-400">{ev.descripcion}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
