import { db } from "@/server/db";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { z } from "zod"
import { Prisma } from "@prisma/client";

export const authorizeAccountAccess = async(accountId: string, userId: string) => {
    const account = await db.account.findFirst({
        where: {
            id: accountId,
            userId: userId,
        },
        select: {
            id: true,
            emailAddress: true,
            name: true,
            accessToken: true,
        }
    })
    if (!account) throw new Error("Unauthorised access. Account not found.")
        return account
}

export const accountRouter = createTRPCRouter({
    getAccounts: privateProcedure.query(async ({ctx}) => {
        return await ctx.db.account.findMany({
            where: {
                userId: ctx.auth.userId
            },
            select: {
                id: true, emailAddress: true, name: true
            }
        })
    }),
    
    getNumThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string(),

    })).query(async({ ctx, input }) => {
        const account = await authorizeAccountAccess(input.accountId, ctx.auth.userId)

        let filter: Prisma.ThreadWhereInput = {}
        if (input.tab === "inbox") {
            filter.inBoxStatus = true
        } else if (input.tab === "draft") {
            filter.draftStatus = true
        } else if (input.tab === "sent") {
            filter.sentStatus = true
        }

        return await ctx.db.thread.count({
            where: {
                accountId: account.id,
                ...filter
            }
        })
    }),

    getThreads: privateProcedure.input(z.object({
        accountId: z.string(),
        tab: z.string(),
        done: z.boolean(),

    })).query(async ({ctx, input}) => {
        // authorize account access
        const account = await authorizeAccountAccess(input.accountId, ctx.auth.userId)

        let filter: Prisma.ThreadWhereInput = {}
        if (input.tab === "inbox") {
            filter.inBoxStatus = true
        } else if (input.tab === "draft") {
            filter.draftStatus = true
        } else if (input.tab === "sent") {
            filter.sentStatus = true
        }

        filter.done = {
            equals: input.done
        }

        return await ctx.db.thread.findMany({
            where: filter,
            include: {
                emails: {
                    orderBy: {
                        sentAt: "asc"
                    },
                    select: {
                        from: true,
                        body: true,
                        bodySnippet: true,
                        emailLabel: true,
                        subject: true,
                        sysLabels: true,
                        id: true,
                        sentAt: true,
                    }
                }
            },
            take: 15,
            orderBy: {
                lastMessageDate: "desc"
            }
        })

    })

})