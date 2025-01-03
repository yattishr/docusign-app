import { create, insert, search, type AnyOrama } from '@orama/orama'
import { db } from './server/db'

const orama = create({
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

const emails = await db.email.findMany({
    select: {
        subject: true,
        body: true,        
        from: true,
        to: true,
        sentAt: true,
        threadId: true,
    }
})

for (const email of emails) {
    console.log(email.subject)
}