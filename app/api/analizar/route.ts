export const runtime = 'nodejs'
export const maxDuration = 300

import { GoogleAIFileManager } from '@google/generative-ai/server'
import { getModel } from '@/lib/gemini'
import type { Evento } from '@/lib/types'

async function waitForFileActive(fileUri: string, apiKey: string, maxWaitMs = 60000) {
  const fileManager = new GoogleAIFileManager(apiKey)
  // Extract file name from URI: "https://...files/abc123" → "files/abc123"
  const fileName = fileUri.split('/').slice(-2).join('/')
  const start = Date.now()

  while (Date.now() - start < maxWaitMs) {
    const file = await fileManager.getFile(fileName)
    if (file.state === 'ACTIVE') return
    if (file.state === 'FAILED') throw new Error('Gemini file processing failed')
    await new Promise(r => setTimeout(r, 2000))
  }

  throw new Error('Timed out waiting for file to become ACTIVE')
}

const PROMPT = `Eres un sistema de análisis de vídeo deportivo. Sigue estos dos pasos.

## PASO 1: Evalúa la calidad del vídeo

Asigna calidad del 1 al 3:
- calidad 1 (baja): móvil desde grada, jugadores pequeños, dorsales ilegibles
- calidad 2 (media): cámara fija, jugadores distinguibles, pocos dorsales legibles
- calidad 3 (alta): TV o cámara profesional, dorsales visibles, acción clara

## PASO 2: Responde según la calidad

**Si calidad = 1 o 2:**
No intentes identificar jugadas específicas. En su lugar, describe objetivamente lo que VES en el vídeo:
- Colores de camisetas de cada equipo
- Ritmo general del partido (pausa, ataque, tiempo muerto...)
- Ambiente (pabellón lleno, exterior, iluminación)
- Cualquier momento llamativo que se vea claramente (celebración, caída, etc.)
NO menciones jugadas concretas, puntos ni estadísticas. Solo describe lo observable.

**Si calidad = 3:**
Identifica eventos concretos con timestamp. Para cada evento describe la evidencia visual exacta que lo confirma.

Devuelve SOLO este JSON sin texto adicional:
{
  "calidad": 1,
  "descripcion_calidad": "frase corta sobre la calidad",
  "narrativa": "descripción en 3-5 frases de lo que se observa en el vídeo (solo para calidad 1 y 2, vacío si calidad 3)",
  "eventos": [
    {
      "tiempo": "00:23",
      "tipo": "canasta_2pts",
      "jugador": "descripción o dorsal si visible",
      "equipo": "local o visitante",
      "confianza": "alta o media",
      "descripcion": "evidencia visual concreta que confirma este evento"
    }
  ]
}

Tipos posibles: canasta_2pts, canasta_3pts, tiro_libre_anotado, tiro_libre_fallado, rebote_ofensivo, rebote_defensivo, asistencia, tapon, robo, falta, perdida
Para calidad 1 o 2, eventos debe ser un array vacío [].`

export async function POST(request: Request) {
  try {
    const { fileUri, mimeType } = await request.json()

    if (!fileUri || !mimeType) {
      return Response.json(
        { error: 'Missing required fields: fileUri, mimeType' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY!
    await waitForFileActive(fileUri, apiKey)

    const model = getModel()

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { fileData: { mimeType, fileUri } },
            { text: PROMPT },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    const text = result.response.text()

    let parsed: { calidad: number; descripcion_calidad: string; narrativa?: string; eventos: Evento[] }
    try {
      parsed = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) {
        return Response.json(
          { error: 'Gemini returned non-JSON response', raw: text },
          { status: 502 }
        )
      }
      parsed = JSON.parse(match[0])
    }

    return Response.json({
      calidad: parsed.calidad ?? 1,
      descripcion_calidad: parsed.descripcion_calidad ?? '',
      narrativa: parsed.narrativa ?? '',
      eventos: parsed.eventos ?? [],
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
