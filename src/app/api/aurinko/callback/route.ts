import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { db } from "@/server/db";
import { auth, EmailAddress } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  console.log(`Logging userId: ${userId}`);
  if (!userId) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  console.log(`Logging status: ${status}`);
  if (status != "success") return NextResponse.json({ message: "Failed to link account" },{ status: 400 });

  // retrieve the code to exchange for the access token.
  const code = params.get('code')
  console.log(`Logging code: ${code}`);
  if (!code) return NextResponse.json({message: 'No code provided'}, {status: 400})
  
  const token = await exchangeCodeForAccessToken(code)
  console.log(`Logging code: ${token}`);
  if (!token) return NextResponse.json({message: 'Failed to exchange code for access token'}, {status: 400})

  const accountDetails = await getAccountDetails(token.accessToken)
  console.log(`Logging account details: ${JSON.stringify(accountDetails)}`)

  // write into Prisma Db
  await db.account.upsert({
    where: {
        id: token.accountId.toString()
    },
    update: {
        accessToken: token.accessToken,
    },
    create: {
        id: token.accountId.toString(),
        userId,
        emailAddress: accountDetails.email,
        name: accountDetails.name,
        accessToken: token.accessToken,
    }
  })

  return NextResponse.json({ Status: "Ok" }, { status: 200 });
};
