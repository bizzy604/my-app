export async function parseMultipartFormData(
  request: Request,
  onProgress?: (progress: number) => void
) {
  const contentType = request.headers.get('content-type')
  if (!contentType?.includes('multipart/form-data')) {
    throw new Error('Content type must be multipart/form-data')
  }

  // Use the built-in FormData parser instead of manual parsing
  try {
    const formData = await request.formData()
    const fields = new Map<string, string>()
    const files = new Map<string, File>()

    // Process the formData and populate fields and files maps
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.set(key, value)
      } else {
        fields.set(key, String(value))
      }
    }

    return { fields, files }
  } catch (error) {
    console.error('Error parsing multipart form data:', error)
    throw new Error('Failed to parse multipart form data')
  }
}