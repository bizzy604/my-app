export async function parseMultipartFormData(
  request: Request,
  onProgress?: (progress: number) => void
) {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('multipart/form-data')) {
    throw new Error('Content type must be multipart/form-data')
  }

  const formData = new FormData()
  const fields = new Map<string, string>()
  const files = new Map<string, File>()

  const reader = request.body?.getReader()
  const contentLength = parseInt(request.headers.get('content-length') || '0')
  let bytesReceived = 0

  if (reader) {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      bytesReceived += value.length
      const progress = (bytesReceived / contentLength) * 100
      onProgress?.(progress)

      // Process the chunk and add to formData
      // ... chunk processing logic
    }
  }

  // Parse the formData and populate fields and files maps
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      files.set(key, value)
    } else {
      fields.set(key, value)
    }
  }

  return { fields, files }
} 