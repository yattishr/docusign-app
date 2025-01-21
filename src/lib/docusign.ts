"use server"
import { FieldValues, RecipientDetails, Tabs, TemplateRoles } from "@/types";
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export const getTemplateDetails = async ({templateId, accessToken}: {templateId: string, accessToken: string}) => {
    const { userId } = await auth();
    const accountId = '32080310'
    
    // url: https://demo.docusign.net/restapi/v2.1/accounts/32080310/templates/e1b8bcf9-bdcb-46a8-b308-070f601191d0

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

export const createEnvelope = async (
  accessToken: string,
  templateId: string,
  recipientDetails: any,
  fieldValues: any,
  accountId: string
) => {
  const apiBaseUrl = 'https://demo.docusign.net/restapi';

  if (!accountId) {
    throw new Error('Failed to create envelope. No Docusign Account provided.');
  }

  // Prepare the envelope details
  const envelopeDefinition = {
    templateId: templateId,
    templateRoles: [
      {
        email: recipientDetails.sendingParty.email,
        name: recipientDetails.sendingParty.name,
        roleName: 'Sending Party', // Role defined in the template
        tabs: {
          textTabs: [
            {
              tabLabel: 'Project-Name', // Matches the label in the DocuSign template
              value: fieldValues.projectName,
            },
            {
              tabLabel: 'Start-Date',
              value: fieldValues.startDate,
            },
          ],
        },
      },
      {
        email: recipientDetails.receivingParty.email,
        name: recipientDetails.receivingParty.name,
        roleName: 'Receiving Party', // Role defined in the template
        tabs: {
          textTabs: [
            {
              tabLabel: 'Receiving-Name',
              value: recipientDetails.receivingParty.name,
            },
            {
              tabLabel: 'Receiving-Email',
              value: recipientDetails.receivingParty.email,
            },
          ],
        },
      },
    ],
    status: 'sent', // Set the status to 'sent' to send the envelope immediately
  };

  try {
    // Make the REST API call
    const response = await fetch(`${apiBaseUrl}/v2.1/accounts/${accountId}/envelopes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelopeDefinition),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`Failed to create envelope. Error: ${errorDetails.message}`);
    }

    const data = await response.json();
    return data.envelopeId;
  } catch (error: any) {
    throw new Error(`Failed to create envelope. ${error.message}`);
  }
};


