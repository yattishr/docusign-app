import jwt from "jsonwebtoken";
import fetch from 'node-fetch';

const privateKey = ``

const integrationKey = ''
const userId = ''
const accountBaseUrl = ''
const apiAccountId = ''

// Generate the JWT
const jwtToken = jwt.sign(
    {
        sub: userId,
        iss: integrationKey,
        aud: accountBaseUrl,
        scope: 'signature impersonation'
    },
    privateKey,
    {algorithm: 'RS256', expiresIn: '1h'} // Token valid for 1 hour
);

// Exchange JWT for Access token
export async function getAccessToken() {
    try {
        const response = await fetch(`${accountBaseUrl}/oauth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwtToken
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error obtaining access token: ', error)
            throw new Error('Failed to fetch access token.')
        }

        // Fetch the Docusign access token
        const tokenData = await response.json()
        console.log('Docusign Access token: ', tokenData)
        // return tokenData

    } catch (error) {
        console.error('Docusign Error: ', error)
        throw error;
    }
}