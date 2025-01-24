import { NextRequest, NextResponse } from 'next/server';
import { handleStreaming } from '@/lib/langchain'; // Ensure you have the correct import

export const POST = async (req: NextRequest) => {
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  const { input, accountId } = await req.json();

  if (!input || !accountId) {
    return NextResponse.json({ message: 'Missing input or accountId' }, { status: 400 });
  }

  try {
    const readableStream = await handleStreaming(input, accountId);

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error processing input:', error);
    return NextResponse.json({ message: 'Error processing input' }, { status: 500 });
  }
};