import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import { getFirebaseApp } from '../lib/firebase'
import { blobToDataUrl, compressImageFile } from '../lib/imageCompress'

const MAX_DATA_URL_CHARS = 850_000

export async function uploadProfilePhoto(
  uid: string,
  file: File,
): Promise<string> {
  const blob = await compressImageFile(file)
  try {
    const storage = getStorage(getFirebaseApp())
    const r = ref(storage, `avatars/${uid}/profile.jpg`)
    await uploadBytes(r, blob, { contentType: 'image/jpeg' })
    return await getDownloadURL(r)
  } catch {
    const dataUrl = await blobToDataUrl(blob)
    if (dataUrl.length > MAX_DATA_URL_CHARS) {
      throw new Error(
        'La imagen sigue siendo muy pesada. Prueba con otra más pequeña.',
      )
    }
    return dataUrl
  }
}
