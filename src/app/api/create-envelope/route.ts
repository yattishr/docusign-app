import { NextApiRequest, NextApiResponse } from 'next';
import { createEnvelope } from '@/lib/docusign';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { accessToken, templateId, recipientDetails, fieldValues, accountId } = req.body;

    if (!accessToken || !templateId || !recipientDetails || !fieldValues || !accountId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const envelopeId = await createEnvelope(accessToken, templateId, recipientDetails, fieldValues, accountId);

    res.status(200).json({ envelopeId });
  } catch (error: any) {
    console.error('Error creating envelope:', error.message);
    res.status(500).json({ message: error.message });
  }
}
