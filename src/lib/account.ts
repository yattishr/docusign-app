import { EmailMessage, SyncResponse, SyncUpdatedResponse } from "@/types";
import axios from "axios";

export class Account {
    private token: string;

    constructor(token: string) {
        this.token = token
    }

    private async startSync() {
        const response = await axios.post<SyncResponse>('https://api.aurinko.io/v1/email/sync', {}, {
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            params: {
                daysWithin: 2,
                bodyType: 'html'
            }
        })
        return response.data
    }

    async getUpdatedEmails( { deltaToken, pageToken } : {deltaToken?: string, pageToken?: string}) {
        let params: Record<string, string> = {}
        if (deltaToken) params.deltaToken = deltaToken
        if (pageToken) params.pageToken = pageToken

        const response = await axios.get<SyncUpdatedResponse>('https://api.aurinko.io/v1/email/sync/updated', {
            headers: {
                Authorization: `Bearer ${this.token}`
            },
            params
        })
        return response.data
    }

    async performInitialSync() {
        try {
            // start the initial sync
            let syncResponse = await this.startSync()
            while (!syncResponse.ready) {
                await new Promise(resolve => setTimeout(resolve, 1000))
                syncResponse = await this.startSync();
            }

            // fetch the bookmark delta token
            let storedDeltaToken: string = syncResponse.syncUpdatedToken
            let updatedResponse = await this.getUpdatedEmails({deltaToken: storedDeltaToken});

            // check if there is a nextDeltaToken
            if (updatedResponse.nextDeltaToken) {
                // the sync has completed and we need to get the latest token
                storedDeltaToken = updatedResponse.nextDeltaToken
            }
            // fetch all the emails
            let allEmails: EmailMessage[] = updatedResponse.records;

            // fetch more pages if there are more
            while (updatedResponse.nextPageToken) {
                updatedResponse = await this.getUpdatedEmails({ pageToken: updatedResponse.nextPageToken})
                allEmails = allEmails.concat(updatedResponse.records);
                if (updatedResponse.nextDeltaToken) {
                    // the sync has ended.
                    storedDeltaToken = updatedResponse.nextDeltaToken
                }
            }
            console.log('Initial sync successful. We have synced: ', allEmails.length, ' emails.')

            // store the latest delta token for future incremental syncs.
            await this.getUpdatedEmails({ deltaToken: storedDeltaToken});

            return {
                emails: allEmails,
                deltaToken: storedDeltaToken
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error during sync: ', JSON.stringify(error.response?.data, null, 2))
            }
            console.error('Error during sync', error)
        }
    }

}