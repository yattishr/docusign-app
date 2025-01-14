import jwt from "jsonwebtoken";
import fetch from 'node-fetch';

const privateKey = `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAq/g273MnPA2+LFVbkHY5GI3G9nkO7SJHpMEtkyc+KGmZ5o7Q
RiQAb/Q4fnZff+3zisDhaxVUkOx8+P7UcGzIof9BVqZdYHhhLrOLde2+5TDcT28g
zc40N7+VcwXQSDVxnElFJHCLZ7itL7HFrrhLnAcVdsG4YCY00D9PUMR+sGAvI23S
He91akIXsqA0HwFf+Iqy0EomV1mxYeS/KvFf6FCdvmRmi0G30+IHi1Esf1P0LIpW
hGXykF7/CXBryqJpT9sg8rpiqB52OLoEggCP2ts0ym3q554dGTRsFnraFRJvhSuy
RlouIu68QZGUvFKDIaW+uQw/up2xrECg3le4vwIDAQABAoIBAEuZrDTqL8Zj2EXP
JJjGkGUt9tjl8VzoZAyW7D0z1EyZ2BGWmRMswpB1Edzulx87cYR/NNoJn4qynGIu
TSA7gpxNBeFc89H0Oez4+4dVhEVnjILTPN2dGDGl5MKTPLRx4kctotrZKz/m3SQJ
h/k+hebK6nGxyidixHcETg8YwwUwGnTqWL/itufh183U3ShO5oiDnH6v8+rw8L1m
GqodDDOiPIJMwoHehOWt1/pHq1HRGnq98xvnween7EyTem2phtjRPczwYJ4vLX6h
Wyr6BsPDWTzKU8eA8CpMorDDz9gVX+A9RuP6/dk2hF2XA1JsHh21da5Kd1mnDw1w
bFc5cMkCgYEA5TZuxZFj3ugof7X8oqJ62jb3G7f3P/eWsN9T30gUkc0UvzT9xx02
zNFS/aOY8hTLBOjdAVH66H7oND6ZMf/w/qvnHc7WLEk1BBtv7djyz6A19ohvsiWl
gk2oDyU7BUzwx75xZr3CwadP8DKd/lFZp/1GhyKYmwKUNFtJlDwlZ30CgYEAwBEw
S6AEpVClQjoaVPmEaL3H+FpdoNHBR/JGl1xfzRik8GIG39gXPogp0XRaf6gQLZj0
zNdnugqx30loXsorT+jpp7mA+61UBXAIT50J7rO8aqO8xB6K7xb2FTA+N62iCtFD
udFrBkMomyJIceB4UEyC8TeAAZ/kPDnAfEhv7esCgYEAw4rqeXYNg47/beRtwLlo
oV0e9vC86D9quT3tKaEumywgNPcaQZH0vEsfx+6Xfn6qrGeUk5nCujH6GwgEXZmB
mWJB6zYXlPRnXDekB397thFxt/6xe4OObVmetD0I2v7Gs0EPMZ1V1yvLkJk+HEZ+
fEggsQycsDFFCl2Oqf2d02kCgYBM9ZY4d0HlS88sHkP20JQxs/mwleT2T5X20ile
9PCeKcXNXDoM73VA5SZ8evbYN+tjmepdOeKiNS7YnX1onfGE73rQbhA0yFrmYuGx
pOcZ8oMI59r3apWY/8ZS7yW/AZ/wXbGZf0Q3GinnH3GPz7Xl1wKQzQBJplu5lhp+
sjfHSQKBgQCOCNKjl4mbJHG383qeGhQIdB8tVfGRFAr6MIQrwdBiFLa32QN6tuEy
Ea1EqWmtIO/a8pGHGrAVWDmZ/2CO0wwQeJ6fYZyGVqiA45sN2hi6N6Y74JLj4G/t
IOqlXFcWGct0fI903rxF9+u3oaar11X8ZPQ2ANgqOE33i0TJJaEf5A==
-----END RSA PRIVATE KEY-----`

const integrationKey = 'b0e9a5f2-a9e2-42a4-b0e6-9b7dfdbe2d2d'
const userId = '78fc2d4b-72a7-4aa9-bf79-55c0b54b78ed'
const accountBaseUrl = 'https://demo.docusign.net'
const apiAccountId = '01f636a9-9461-47df-9f2d-21c6d29517e0'

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