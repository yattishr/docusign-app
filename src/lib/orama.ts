import { db } from '@/server/db';
import { create, insert, search, type AnyOrama } from '@orama/orama'
import { restore, persist } from '@orama/plugin-data-persistence'

export class OramaClient {
    // @ts-ignore
    private orama: AnyOrama
    private accountId: string;

    // accountId constructor for the orama client
    constructor(accountId: string) {
        this.accountId = accountId       
    }

    // save the orama index to the database
    async saveIndex() {
        console.log('--- saving Orama index ---')
        const index = await persist(this.orama, 'json')
        await db.account.update({
            where: {
                id: this.accountId
            },
            data: {
                oramaIndex: index
            }
        })
    }

    // initialize the orama index
    async initialize() {
        console.log('--- initializing Orama ---')
        const account = await db.account.findUnique({
            where: {
                id: this.accountId
            }
        })

        if (!account) {
            throw new Error('Account not found')
        }

        if (account.oramaIndex) {
            this.orama = await restore('json', account.oramaIndex as any)
        } else {
             this.orama = await create({
                schema: { 
                    subject: 'string',
                    body: 'string',
                    rawBody: 'string',
                    from: 'string',
                    to: 'string',
                    sentAt: 'string',
                    threadId: 'string',
                }
            })
            await this.saveIndex()
        }

    }

    // search the orama index for a term
    async search({term}: {term: string}) {
        console.log(`--- searching Orama for: ${term} ---`)
        return await search(this.orama, {
            term
        })
    }

    // insert a new document into the orama index
    async insert(document: any) {
        console.log('--- inserting document  to Orama ---')
        await insert(this.orama, document)
        await this.saveIndex()
    }
}