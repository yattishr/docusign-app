import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { NextApiRequest, NextApiResponse } from "next";
// import * as docusign from 'docusign-esign';
import { ApiClient, EnvelopesApi, EnvelopeDefinition, TemplateRole } from 'docusign-esign';

export const POST = async (req: NextRequest) => {
    const tokenUrl = 'https://account-d.docusign.com/oauth/token'
    const clientId = process.env.DS_CLIENT_ID
    const clientSecret = process.env.DS_SECRET_KEY
    const redirectUri = encodeURIComponent('http://localhost:3000/mail')

    const { userId } = await auth();
    console.log(`Logging userId: ${userId}`);
    
    if (!userId) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
    
    const { code: auth_code } = await req.json()
    console.log(`Logging Authorization Code: ${auth_code}`);

    if (!auth_code) return NextResponse.json({ message: "Failed to obtain Authorization Code" },{ status: 400 });

    // Fetch the Account details for the Logged in user.
    const account = await db.account.findFirst({
        where: {userId: userId},
        orderBy: {id: 'desc'}
    })
    
    try {
        // Prepare the payload for the token request
        const payload = new URLSearchParams();
        payload.append("grant_type", "authorization_code")
        payload.append("code", auth_code)
        payload.append("redirect_uri", redirectUri)

        // Make the POST request to Docusign's token endpoint
        const response = await axios.post(tokenUrl, payload, {
            headers: {
                'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        const {access_token, refresh_token, expires_in, token_type} = response.data
        console.log("Access token: ", access_token),
        console.log("Refresh token: ", refresh_token),
        console.log("Expires in: ", expires_in)

        // Update Db with the access token and refresh token
        try {
            console.log('Saving tokens to the database...')
            await db.account.update({
                where: {id: account?.id},
                data: {
                    docusignAccessToken: access_token,
                    docusignRefreshToken: refresh_token,
                    updatedAt: new Date(),
                }
            })
        } catch (error) {
            console.error('An error occurred while saving the tokens to the database: ', error)
        }

        // Return tokens to the client
        return NextResponse.json({ access_token, refresh_token, expires_in}, {status: 200})

    } catch (error: any) {
        console.log("Error fetching Docusign access tokens: ", error.response?.data || error.message)
        return NextResponse.json({message: "Failed to exchange Docusign Authorization Code for Access Token. Error: ", error}, 
        {status: 500})
    }
}



