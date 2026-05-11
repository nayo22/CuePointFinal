import { blobToDataUrl, compressImageFile } from '../lib/imageCompress'

const MAX_DATA_URL_CHARS = 850_000

export async function uploadProfilePhoto(file: File): Promise<string> {
  const blob = await compressImageFile(file)
  const dataUrl = await blobToDataUrl(blob)
  if (dataUrl.length > MAX_DATA_URL_CHARS) {
    throw new Error(
      'The image is still too large after compression. Pick a smaller image.',
    )
  }
  return dataUrl
}
