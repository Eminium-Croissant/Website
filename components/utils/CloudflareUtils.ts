// Cloudflare environment detection and error handling
export function isCloudflareEnvironment(): boolean {
  if (typeof globalThis !== 'undefined') {
    return !!(globalThis as any).caches || !!(globalThis as any).Request;
  }
  return false;
}

export function handleCloudflareError(error: any, context: string): void {
  console.error(`[Cloudflare Error in ${context}]:`, {
    message: error?.message,
    stack: error?.stack,
    name: error?.name,
    cause: error?.cause
  });
  
  // Log environment info for debugging
  if (isCloudflareEnvironment()) {
    console.log('[Environment]: Running in Cloudflare Workers');
  } else {
    console.log('[Environment]: Running in Node.js');
  }
}

export function createCloudflareCompatibleResponse(data: any, status: number = 200): Response {
  try {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });

    return new Response(
      JSON.stringify(data),
      { status, headers }
    );
  } catch (error) {
    handleCloudflareError(error, 'createCloudflareCompatibleResponse');
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}