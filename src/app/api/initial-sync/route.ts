import { Account } from "@/lib/account";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";
import { db } from "@/server/db";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const { accountId, userId } = await req.json()
    if (!accountId || !userId) {
        return NextResponse.json({error: 'Missing accountId or userId'}, {status: 400})
    }

    const dbAccount = await db.account.findUnique({
        where: {
            id: accountId,
            userId
        }
    })

    if (!dbAccount) return NextResponse.json({error: `Account ${accountId} not found`}, { status: 404 })

    // perform initial email download.
    const account = new Account(dbAccount.accessToken)    
    const response = await account.performInitialSync()
    if (!response) {
        return NextResponse.json({ error: 'Failed to perform initial sync'}, {status: 500})
    }

    const { emails, deltaToken } = response
    // console.log(`Logging initial email download: ${emails}`);

    await db.account.update({
        where: {
            id: accountId
        },
        data: {
            nextDeltaToken: deltaToken
        }
    })

    // begin syncing emails to Prisma
    await syncEmailsToDatabase(emails, accountId)
    console.log("Email sync completed successfully.", deltaToken)

    return NextResponse.json({ success: true}, { status: 200})
}