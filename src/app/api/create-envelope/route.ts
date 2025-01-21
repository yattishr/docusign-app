import { NextApiRequest, NextApiResponse } from 'next';
import { createEnvelope } from '@/lib/docusign';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest, res: NextResponse) {
  // only allow POST requests
  if (req.method !== 'POST') {
    return NextResponse.json({message: 'Method not allowed'}, {status: 405})
  }

  try {
    const { userId } = await auth();
    console.log(`Logging userId: ${userId}`);

    if (!userId) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });

    const { accessToken, templateId, recipientDetails, fieldValues, accountId } = await req.json();

    const envelopeId = await createEnvelope(accessToken, templateId, recipientDetails, fieldValues, accountId);

    return NextResponse.json({ envelopeId }, { status: 200 });

  } catch (error: any) {
    console.error('Error creating envelope:', error);
    return NextResponse.json({ message: 'Internal server error', error: error.message }, { status: 500 });
  }
}
