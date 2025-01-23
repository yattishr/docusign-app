import { NextRequest, NextResponse } from 'next/server';
import { listTemplates } from '@/lib/docusign';
import { auth } from "@clerk/nextjs/server";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });

  const accountId = 'your-account-id'; // Replace with your actual account ID
  const accessToken = 'your-access-token'; // Replace with your actual access token

  try {
    const templates = await listTemplates(accessToken);
    return NextResponse.json({ templates }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
};