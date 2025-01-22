"use server"
import { auth } from "@clerk/nextjs/server";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

// Get the details of a template using the provided access token and template ID
export const getTemplateDetails = async ({templateId, accessToken}: {templateId: string, accessToken: string}) => {
    const { userId } = await auth();
    console.log(`Logging userId: ${userId}`);

    const accountId = '32080310'
    
    // url: https://demo.docusign.net/restapi/v2.1/accounts/32080310/templates/e1b8bcf9-bdcb-46a8-b308-070f601191d0
    
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

// Create an envelope using the provided access token, template ID, recipient details, field values, and account ID
export const createEnvelope = async (
  accessToken: string,
  templateId: string,
  recipientDetails: any,
  fieldValues: any,
  accountId: string
) => {
  // Get the user ID
  const { userId } = await auth();
  console.log(`--- Creating envelope for user: ${userId} on account: ${accountId} ---`);

  // Check if the user ID is available and return an error if not
  if (!userId) return NextResponse.json({ message: "Unauthorised" }, { status: 401 });

  const apiBaseUrl = 'https://demo.docusign.net/restapi';

  // Validate the Docusign account Id required parameter
  if (!accountId) {
    throw new Error('Failed to create envelope. No DocuSign Account provided.');
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
              tabLabel: 'Company-Name', // Matches the label in the DocuSign template
              value: fieldValues.companyName,
            },
            {
              tabLabel: 'Project-Name', // Matches the label in the DocuSign template
              value: fieldValues.projectName,
            },
            {
              tabLabel: 'Project-Start',
              value: fieldValues.startDate,
            },
            {
              tabLabel: 'Project-Duration',
              value: fieldValues.projectDuration,
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
            {
              tabLabel: 'Receiving-Reason',
              value: recipientDetails.receivingParty.receivingReason,
            },
          ],
        },
      },
    ],
    status: 'sent', // Set the status to 'sent' to send the envelope immediately
  };

  try {
    // Make the REST API call
    console.log('Make the API call to create the envelope...');
    const response = await fetch(`${apiBaseUrl}/v2.1/accounts/${accountId}/envelopes`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(envelopeDefinition),
    });

    // Check if the API call was successful
    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`Failed to create envelope. Error: ${errorDetails.message}`);
    }

    // Parse the response data and log the envelope ID
    const data = await response.json();
    console.log(`Envelope created successfully: ${data.envelopeId}`);

    // Return the envelope ID
    return data.envelopeId;

  } catch (error: any) {
    throw new Error(`Failed to create envelope. ${error.message}`);
  }
};

// Extract field values from an email thread using OpenAI GPT-3
const generateFieldValues = async (emailThread: string, threadId: string) => {
  const prompt = `Extract the following details from this email thread:
  - Project name
  - Start date
  - Recipient name

  Email thread: ${emailThread}`;

  const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          model: "text-davinci-003",
          prompt: prompt,
          max_tokens: 200,
      }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].text);
};



