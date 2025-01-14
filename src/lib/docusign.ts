"use server"
import { auth } from "@clerk/nextjs/server";
import axios from "axios"

const privateKey = ``
const integrationKey = ''
const userId = ''
const accountBaseUrl = ''
const apiAccountId = ''

// Exchange JWT for Access token
export async function getAccessToken(code: string) {
    try {

        // Validate if the user is authenticated. Raise an error if unauthorized.
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorised access");

        // Get the Code from the URL Params
        const params = new URLSearchParams({
            
        })

    } catch (error) {
        console.error('Docusign Error: ', error)
        throw error;
    }
}