// import { db } from "@/server/db";
import { db } from '../server/db';
import { EmailMessage, EmailAddress, EmailAttachment } from "@/types";
import pLimit from "p-limit"
import { OramaClient } from "./orama";
import { turndown } from "./turndown";
import { getEmbeddings } from "./embeddings";

export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
    console.log(`--- Email sync from syncEmailsToDatabase initiated. Syncing ${emails.length} emails to database. ---`)
    const limit = pLimit(1)

    // save emails to OramaClient
    const orama = new OramaClient(accountId)
    console.log('--- sync-to-db: Initializing OramaClient ---')

    for (const email of emails) {
        const body = turndown.turndown(email.body ?? email.bodySnippet ?? '')
        const embeddings = await getEmbeddings(body)

        // Format the document to ensure compatability with Orama
        const formattedDocument = {
            subject: email.subject ?? '', // Default to empty string if undefined
            body: body,
            rawBody: 'TEST RAW BODY SNIPPET',
            from: email.from?.name
                ? `${email.from.name} <${email.from.address}>`
                : email.from.address ?? 'Unkown Sender',
            to: email.to?.map(to => `${to.name} <${to.address}>`).join(', ') ?? '', // Convert to string
            sentAt: new Date(email.sentAt).toISOString(),
            threadId: email.threadId ?? 'Unknown Thread Id',
            embeddings: embeddings,
        };

        // Log the formatted document for debugging
        console.log('Formatted document for Orama insertion: ', formattedDocument)

        // Insert the formatted document into Orama
        try {
            await orama.insert(formattedDocument)
            console.log('Document successfully inserted into Orama')
        } catch (error) {
            console.error('Failed to insert document into Orama index: ', error)
        }

        // Upsert email into Prisma database
        try {
            await upsertEmail(email, accountId, 0)    
        } catch (error) {
            console.error('Failed to upsert email into Prisma database: ', error)   
        }        
    }
}

async function upsertEmail(email: EmailMessage, accountId: string, index: number) {
    console.log("Upserting email: ", index)

    try {
        let emailLabelType: 'inbox' | 'sent' | 'draft' = 'inbox'
        if (email.sysLabels.includes('inbox') || email.sysLabels.includes('important')) {
            emailLabelType = 'inbox'
        } else if (email.sysLabels.includes('sent')) {
            emailLabelType = 'sent'
        } else if (email.sysLabels.includes('draft')) {
            emailLabelType = 'draft'
        }

        const addressesToUpsert = new Map()
        for (const address of [email.from, ...email.to, ...email.cc, ...email.bcc, ...email.replyTo]) {
            addressesToUpsert.set(address.address, address)
        }

        const upsertedAddresses: (Awaited<ReturnType<typeof upsertEmailAddress>>)[] = []

        for (const address of addressesToUpsert.values()) {
            const upsertedAddress = await upsertEmailAddress(address, accountId)
            upsertedAddresses.push(upsertedAddress)
        }

        const addressMap = new Map(
            upsertedAddresses.filter(Boolean).map(address => [address!.address, address])
        )

        const fromAddress = addressMap.get(email.from.address);
        if (!fromAddress) {
            console.log(`Failed to upsert from address.`)
            return;
        }

        const toAddresses = email.to.map(addr => addressMap.get(addr.address)).filter(Boolean)
        const ccAddresses = email.cc.map(addr => addressMap.get(addr.address)).filter(Boolean)
        const bccAddresses = email.bcc.map(addr => addressMap.get(addr.address)).filter(Boolean)
        const replyToAddresses = email.replyTo.map(addr => addressMap.get(addr.address)).filter(Boolean)

        // Upsert Threads
        const thread = await db.thread.upsert({
            where: { id: email.threadId },
            update: {
                subject: email.subject,
                accountId,
                lastMessageDate: new Date(email.sentAt),
                done: false,
                participantIds: [...new Set([
                    fromAddress.id,
                    ...toAddresses.map(a => a!.id),
                    ...ccAddresses.map(a => a!.id),
                    ...bccAddresses.map(a => a!.id)
                ])]
            }, 
            create: {
                id: email.threadId,
                accountId,
                subject: email.subject,
                done: false,
                draftStatus: emailLabelType === 'draft',
                inBoxStatus: emailLabelType === 'inbox',
                sentStatus: emailLabelType === 'sent',
                lastMessageDate: new Date(email.sentAt),
                participantIds: [...new Set ([
                    fromAddress.id,
                    ...toAddresses.map(a => a!.id),
                    ...ccAddresses.map(a => a!.id),
                    ...bccAddresses.map(a => a!.id)
                ])]
            }
        })

        // Upsert Email
        await db.email.upsert({
            where: { id: email.id },
            update: {
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                keywords: email.keywords  as any,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: {set: toAddresses.map(a => ({id: a!.id}))},
                cc: {set: ccAddresses.map(a => ({id: a!.id}))},
                bcc: {set: bccAddresses.map(a => ({id: a!.id}))},
                replyTo: {set: replyToAddresses.map(a => ({ id: a!.id}))},
                hasAttachments: email.hasAttachments,
                body: email.body,
                bodySnippet: email.bodySnippet,                
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties as any,
                folderId: email.folderId,
                ommitted: email.ommitted,
                emailLabel: emailLabelType,
            },

            create: {
                id: email.id,
                emailLabel: emailLabelType,
                threadId: thread.id,
                createdTime: new Date(email.createdTime),
                lastModifiedTime: new Date(),
                sentAt: new Date(email.sentAt),
                receivedAt: new Date(email.receivedAt),
                internetMessageId: email.internetMessageId,
                subject: email.subject,
                sysLabels: email.sysLabels,
                internetHeaders: email.internetHeaders as any,
                keywords: email.keywords  as any,
                sysClassifications: email.sysClassifications,
                sensitivity: email.sensitivity,
                meetingMessageMethod: email.meetingMessageMethod,
                fromId: fromAddress.id,
                to: {connect: toAddresses.map(a => ({id: a!.id}))},
                cc: {connect: ccAddresses.map(a => ({id: a!.id}))},
                bcc: {connect: bccAddresses.map(a => ({id: a!.id}))},
                replyTo: {connect: replyToAddresses.map(a => ({id: a!.id}))},
                hasAttachments: email.hasAttachments,
                body: email.body,
                bodySnippet: email.bodySnippet,                
                inReplyTo: email.inReplyTo,
                references: email.references,
                threadIndex: email.threadIndex,
                nativeProperties: email.nativeProperties as any,
                folderId: email.folderId,
                ommitted: email.ommitted,
            }
        });

        const threadEmails = await db.email.findMany({
            where: { threadId: thread.id },
            orderBy: { receivedAt: 'asc'}
        });

        let threadFolderType = 'sent';
        for (const threadEmail of threadEmails) {
            if (threadEmail.emailLabel === 'inbox') {
                threadFolderType = 'inbox';
                break; // If any email is in the inbox, the entire thread is in the inbox also.
            } else if (threadEmail.emailLabel === 'draft') {
                threadFolderType = 'draft';
            }            
        }

        await db.thread.update({
            where: { id: thread.id },
            data: {
                draftStatus: threadFolderType === 'draft',
                inBoxStatus: threadFolderType === 'inbox',
                sentStatus: threadFolderType === 'sent',
            }
        });

        for (const attachment of email.attachments) {
            await upsertAttachment(email.id, attachment);
        }

    } catch (error) {
        console.error("Failed to insert email address", error)
        return null
    }
}

async function upsertAttachment(emailId: string, attachment: EmailAttachment) {
    try {
        await db.emailAttachment.upsert({
            where: {id: attachment.id ?? ""},
            update: {
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation,
            },
            create: {
                id: attachment.id,
                emailId,
                name: attachment.name,
                mimeType: attachment.mimeType,
                size: attachment.size,
                inline: attachment.inline,
                contentId: attachment.contentId,
                content: attachment.content,
                contentLocation: attachment.contentLocation,
            }
        })
    } catch (error) {
        console.log("Failed to upsert attachment for email: ", emailId, "Failed with error: ", error)        
    }
}

async function upsertEmailAddress(address: EmailAddress, accountId: string) {
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where: { accountId_address: {accountId: accountId, address: address.address ?? ""}}
        });

        if (existingAddress) {
            return await db.emailAddress.findUnique({
                where: { id: existingAddress.id }        
            });
        } else {
            return await db.emailAddress.create({
                data: { address: address.address ?? "", name: address.name, raw: address.raw, accountId}
            });
        }
    } catch (error) {
        console.log("Failed to upsert email address", error)
        return null
    }
}