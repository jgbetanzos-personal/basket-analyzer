export async function POST(request: Request) {
  try {
    const { filename, mimeType, size } = await request.json()

    if (!filename || !mimeType || !size) {
      return Response.json(
        { error: 'Missing required fields: filename, mimeType, size' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable&key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'X-Goog-Upload-Protocol': 'resumable',
          'X-Goog-Upload-Command': 'start',
          'X-Goog-Upload-Header-Content-Length': String(size),
          'X-Goog-Upload-Header-Content-Type': mimeType,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: { displayName: filename } }),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      return Response.json(
        { error: `Gemini API error: ${res.status} ${text}` },
        { status: 502 }
      )
    }

    const uploadUrl = res.headers.get('X-Goog-Upload-URL')

    if (!uploadUrl) {
      return Response.json(
        { error: 'Gemini did not return an upload URL' },
        { status: 502 }
      )
    }

    return Response.json({ uploadUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: message }, { status: 500 })
  }
}
