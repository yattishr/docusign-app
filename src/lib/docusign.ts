"use server"
import { FieldValues, RecipientDetails, Tabs, TemplateRoles } from "@/types";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const getTemplateDetails = async ({templateId, accessToken}: {templateId: string, accessToken: string}) => {
    const { userId } = await auth();
    const accountId = '32080310'
    
    // url: https://demo.docusign.net/restapi/v2.1/accounts/32080310/templates/c8b0c006-0ed8-4dab-93bb-4fc2e6555432

    console.log(`Logging userId: ${userId}`);
    if (!userId) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });

    const response = await fetch(`https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/templates/${templateId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

    if (!response.ok) {
        throw new Error('Failed to fetch template details.')
    }

    const data = await response.json()
    return data
}


// ---
export const sendEnvelope = async (
    templateId: string,
    accessToken: string,
    recipientDetails: RecipientDetails,
    fieldValues: FieldValues
): Promise<void> => {
    // Construct the envelope definition using the types
    const envelopeDefinition = {
        templateId: templateId,
        templateRoles: [
            {
                email: recipientDetails.email,
                name: recipientDetails.name,
                roleName: "Signer",
                tabs: {
                    textTabs: [
                        {
                            tabLabel: "ProjectName",
                            value: fieldValues.projectName
                        },
                        {
                            tabLabel: "StartDate",
                            value: fieldValues.startDate
                        }
                    ]
                } as Tabs
            }
        ] as TemplateRoles[],
        status: "sent",
    }

    // Make the API request
    try {
        const response = await axios.post(
            `https://account.docusign.com/v2.1/accounts/{accountId}/envelopes`,
            envelopeDefinition,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                }
            }
        )
        console.log("Envelope sent: ", response.data)
    } catch (error) {
        console.error("Error sending envelope: ", error)
    }

}

