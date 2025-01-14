import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

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
    
    try {
        // Prepare the payload for the token request
        const payload = new URLSearchParams();
        payload.append("grant_type", "authorization_code")
        payload.append("code", auth_code)
        payload.append("client_id", clientId || "")
        payload.append("client_secret", clientSecret || "")
        payload.append("redirect_uri", redirectUri)

        // Make the POST request to Docusign's token endpoint
        const response = await axios.post(tokenUrl, payload, {
            headers: {
                "Content-Type": "application/x-www-from-urlencoded",
            },
        })

        const tokenData = response.data
        console.log(`Access Token Response: ${tokenData}`)
        return NextResponse.json({ tokenData}, {status: 200})
    } catch (error) {
        NextResponse.json({message: "Failed to exchange Docusign Authorization Code for Access Token. Error: ", error}, 
        {status: 500})
    }
}


// TO DO:
// 1. Store the Docusign Access token and Refresh token in the Accounts table on the Db.