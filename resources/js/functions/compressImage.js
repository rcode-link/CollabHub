const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Files below this size are uploaded as-is — re-encoding tiny images is not worth it
const MIN_SIZE_BYTES = 200 * 1024

/**
 * Downscales and re-encodes an image file before upload.
 * GIFs (animation), SVGs, and non-image files pass through untouched,
 * as does any file where re-encoding would not actually shrink it.
 *
 * @param {File} file
 * @param {{ maxDimension?: number, quality?: number }} options
 * @returns {Promise<File>}
 */
export async function compressImage(file, { maxDimension = 1920, quality = 0.8 } = {}) {
    if (!(file instanceof File)) return file
    if (!COMPRESSIBLE_TYPES.includes(file.type)) return file
    if (file.size < MIN_SIZE_BYTES) return file

    try {
        const bitmap = await createImageBitmap(file)
        const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
        const width = Math.max(1, Math.round(bitmap.width * scale))
        const height = Math.max(1, Math.round(bitmap.height * scale))

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
        bitmap.close()

        const blob = await new Promise(resolve => canvas.toBlob(resolve, file.type, quality))

        if (!blob || blob.size >= file.size) return file

        return new File([blob], file.name, { type: file.type, lastModified: file.lastModified })
    } catch {
        // Undecodable/corrupt image — let the backend deal with the original
        return file
    }
}

/** Compress a list of files, leaving non-images untouched. */
export function compressImages(files, options) {
    return Promise.all(Array.from(files).map(file => compressImage(file, options)))
}
