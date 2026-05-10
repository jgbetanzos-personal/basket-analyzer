export async function uploadVideo(
  file: File,
  onProgress: (pct: number) => void
): Promise<{ fileUri: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          if (response.error) {
            reject(new Error(response.error))
          } else {
            onProgress(100)
            resolve({ fileUri: response.fileUri, mimeType: response.mimeType })
          }
        } catch {
          reject(new Error('Failed to parse upload response'))
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}
