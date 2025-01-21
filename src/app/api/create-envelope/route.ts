import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createEnvelope } from '@/lib/docusign';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { userId } = await auth();
    console.log(`Logging userId: ${userId}`);
        
    if (!userId) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });

    const { accessToken, templateId, recipientDetails, fieldValues, accountId } = req.body;

    const envelopeId = await createEnvelope(accessToken, templateId, recipientDetails, fieldValues, accountId);

    res.status(200).json({ envelopeId });
  } catch (error) {
    console.error('Error creating envelope:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}