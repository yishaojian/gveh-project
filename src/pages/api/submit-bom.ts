import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const email = formData.get('email') as string;
    const bomText = formData.get('bomText') as string;
    const file = formData.get('file') as File | null;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload: {
      email: string;
      bomText?: string;
      file?: {
        name: string;
        type: string;
        size: number;
        buffer: string;
      };
      timestamp: string;
    } = {
      email,
      bomText: bomText || undefined,
      timestamp: new Date().toISOString()
    };

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      payload.file = {
        name: file.name,
        type: file.type,
        size: file.size,
        buffer: buffer.toString('base64')
      };
    }

    console.log('[BOM Submit] Received submission:', {
      email: payload.email,
      hasFile: !!payload.file,
      fileName: payload.file?.name,
      fileSize: payload.file?.size,
      hasBomText: !!payload.bomText,
      timestamp: payload.timestamp
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'BOM submitted successfully',
        receivedAt: payload.timestamp
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[BOM Submit] Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process BOM submission',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
