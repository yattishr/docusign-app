import { db } from '../server/db';
import { create, insert, search, type AnyOrama } from '@orama/orama'
import { restore, persist } from '@orama/plugin-data-persistence'
import { getEmbeddings } from './embeddings';

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
        console.log('Persisted index:', JSON.stringify(index, null, 2))

        if (!index) { 
            console.log('Failed to persist orama index. Index is empty:', index)
            return
        }

        console.log('Persisted index:', index);

        try {
            await db.account.update({
                where: {
                    id: this.accountId
                },
                data: {
                    oramaIndex: index
                }
            })
            console.log('Index saved successfully to database');
        } catch (error) {
            console.error('Failed to save index to database:', error)
        }

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
            console.log('--- Restoring Orama index ---');
            this.orama = await restore('json', account.oramaIndex as any)
        } else {
             console.log('--- Creating new Orama index ---')
             this.orama = await create({
                schema: { 
                    subject: 'string',
                    body: 'string',
                    rawBody: 'string',
                    from: 'string',
                    to: 'string',
                    sentAt: 'string',
                    threadId: 'string',
                    embeddings: 'vector[1536]',
                }
            })

            // Save the new index
            await this.saveIndex()
        }
    }

    // search the orama index for a term
    async search({term}: {term: string}) {
        const results = await search(this.orama, { term: term });
        console.log('Search results:', results);
        return results;
    }

    // insert a new document into the orama index
    async insert(document: any) {
        console.log('Inserting document:', document);
        
        const { subject, body, rawBody, from, to, sentAt, threadId } = document
        if (!subject || !body || !rawBody || !from || !to || !sentAt || !threadId) {
            console.log('Document is missing required fields: ', document)
            return
        }

        // Insert the document into Orama
        await insert(this.orama, document)

        // List documents after inserting for validation
        const documents = await this.listDocuments()
        console.log('Documents in index: ', documents)

        // Persist the index after inserting
        await this.saveIndex()

    }

    // list all documents in the orama index
    async listDocuments() {
        console.log('--- Listing all Orama documents ---')
        const results = await search(this.orama, {term: ''}) // Empy term to return all documents
        console.log('All documents', results.hits)
    }

    async vectorSearch({ term }: {term: string}) {
        // vector embed the search term
        const embeddings = await getEmbeddings(term)
        const results = await search(this.orama, {
            mode: 'hybrid',
            term: term,
            vector: {
                value: embeddings,
                property: 'embeddings'
            },
            similarity: 0.8,
            limit: 10
        })
        return results
    }
}