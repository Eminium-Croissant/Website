/**
 * Utilitaires pour interagir avec Cloudflare R2
 */

export interface R2UploadResult {
  key: string;
  etag: string;
  size: number;
}

/**
 * Upload un buffer vers R2
 */
export async function uploadToR2(
  bucket: R2Bucket,
  key: string,
  data: ArrayBuffer | Uint8Array | ReadableStream,
  contentType: string = 'application/octet-stream',
  metadata?: Record<string, string>
): Promise<R2UploadResult> {
  const object = await bucket.put(key, data, {
    httpMetadata: {
      contentType,
    },
    customMetadata: metadata,
  });

  if (!object) {
    throw new Error(`Failed to upload ${key} to R2`);
  }

  return {
    key,
    etag: object.etag,
    size: object.size,
  };
}

/**
 * Récupère un objet depuis R2
 */
export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  return await bucket.get(key);
}

/**
 * Vérifie si un objet existe dans R2
 */
export async function existsInR2(
  bucket: R2Bucket,
  key: string
): Promise<boolean> {
  const object = await bucket.head(key);
  return object !== null;
}

/**
 * Supprime un objet de R2
 */
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

/**
 * Trouve un fichier avec différentes extensions
 */
export async function findFileWithExtensions(
  bucket: R2Bucket,
  baseName: string,
  extensions: string[] = ['.avif', '.webp', '.png', '.jpg', '.jpeg', '.gif']
): Promise<{ key: string; object: R2ObjectBody } | null> {
  for (const ext of extensions) {
    const key = `${baseName}${ext}`;
    const object = await bucket.get(key);
    if (object) {
      return { key, object };
    }
  }
  return null;
}

/**
 * Obtient le Content-Type basé sur l'extension
 */
export function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const types: Record<string, string> = {
    avif: 'image/avif',
    webp: 'image/webp',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
  };
  return types[ext || ''] || 'application/octet-stream';
}

/**
 * Convertit un R2Object en Response avec les bons headers
 */
export function createImageResponse(
  object: R2ObjectBody,
  cacheMaxAge: number = 300
): Response {
  const headers = new Headers();
  
  if (object.httpMetadata?.contentType) {
    headers.set('Content-Type', object.httpMetadata.contentType);
  }
  
  if (object.size) {
    headers.set('Content-Length', object.size.toString());
  }
  
  headers.set('Cache-Control', `public, max-age=${cacheMaxAge}`);
  headers.set('ETag', object.etag);
  
  if (object.httpMetadata?.cacheControl) {
    headers.set('Cache-Control', object.httpMetadata.cacheControl);
  }
  
  return new Response(object.body, { headers });
}