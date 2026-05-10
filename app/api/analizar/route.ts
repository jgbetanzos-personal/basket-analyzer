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

const PROMPT = `Eres un analista experto en baloncesto. Analiza este vídeo de un partido e identifica todos los eventos importantes.

Devuelve SOLO un JSON válido con este formato exacto, sin texto adicional:
{
  "eventos": [
    {
      "tiempo": "00:23",
      "tipo": "canasta_2pts",
      "jugador": "número de dorsal o descripción del jugador",
      "equipo": "local",
      "descripcion": "descripción breve en español"
    }
  ]
}

Tipos de evento posibles: canasta_2pts, canasta_3pts, tiro_libre_anotado, tiro_libre_fallado, rebote_ofensivo, rebote_defensivo, asistencia, tapon, robo, falta, perdida

Si no puedes identificar el nombre del jugador usa el número de dorsal. Si tampoco ves el dorsal, describe físicamente al jugador (ej: "jugador alto local", "base visitante").
El equipo puede ser "local" o "visitante".`

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

    let parsed: { eventos: Evento[] }
    try {
      parsed = JSON.parse(text)
    } catch {
      // Try to extract JSON from the response if it has extra text
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) {
        return Response.json(
          { error: 'Gemini returned non-JSON response', raw: text },
          { status: 502 }
        )
      }
      parsed = JSON.parse(match[0])
    }

    return Response.json({ eventos: parsed.eventos ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
