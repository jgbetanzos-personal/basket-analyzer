import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { GoogleAIFileManager } from '@google/generative-ai/server'
import 'server-only'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Save to temp file so GoogleAIFileManager can read it
    const buffer = Buffer.from(await file.arrayBuffer())
    const tmpPath = join(tmpdir(), `basketball-${Date.now()}.mp4`)
    await writeFile(tmpPath, buffer)

    try {
      const fileManager = new GoogleAIFileManager(apiKey)
      const uploadResult = await fileManager.uploadFile(tmpPath, {
        mimeType: file.type || 'video/mp4',
        displayName: file.name,
      })

      return Response.json({
        fileUri: uploadResult.file.uri,
        mimeType: file.type || 'video/mp4',
      })
    } finally {
      await unlink(tmpPath).catch(() => {})
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
