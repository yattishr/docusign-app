"use client";
import React, { useState } from "react";
import useThreads from "../hooks/use-threads";
import { Button } from "@/components/ui/button";
import {
  Archive,
  ArchiveX,
  Clock,
  CloudCogIcon,
  MoreVerticalIcon,
  Trash2Icon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns";
import EmailDisplay from "./email-display";
import ReplyBox from "./reply-box";
import { useAtom } from "jotai";
import { isSearchingAtom } from "@/components/mail/search-bar";
import SearchDisplay from "@/components/mail/search-display";
import { useLocalStorage } from 'usehooks-ts';

// Docusign function call
import { getTemplateDetails } from '@/lib/docusign';

// Our own Spinner component
import Spinner from '@/components/spinner';

const ThreadDisplay = () => {
  const { threadId, threads } = useThreads();
  const thread = threads?.find((t) => t.id === threadId);
  const [isSearching] = useAtom(isSearchingAtom);
  const [docusignAccessToken] = useLocalStorage('docusignAccessToken', '');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // For the purposes of testing we hard code our template Id.
  const templateId = 'e1b8bcf9-bdcb-46a8-b308-070f601191d0'; // Replace with the actual template ID  
  
  // Authorise with DocuSign and get the access token.
  const handleDocuSignAuth = () => {
    setIsProcessing(true);

    try {
      const clientId = process.env.NEXT_PUBLIC_DS_CLIENT_ID
      const redirectUri = encodeURIComponent('http://localhost:3000/mail')
      const docusignUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${clientId}&redirect_uri=${redirectUri}`;
      window.location.href = docusignUrl      
    } catch (error) {
      console.error('Error authorising with DocuSign:', error);
    } finally {
      setIsProcessing(false);
    }

  }

  // Get the details of the template using the provided access token and template ID
  const handleGetTemplateDetails = async () => {    
    try {
      const templateDetails = await getTemplateDetails({ templateId, accessToken: docusignAccessToken });
      console.log('Template Details:', JSON.stringify(templateDetails));

      // Handle the template details as needed
    } catch (error) {
      console.error('Error fetching template details:', error);
    }
  };

  // Create an envelope using the provided access token, template ID, recipient details, field values, and account ID
  const handleCreateEnvelope = async () => {
    if (!docusignAccessToken || !templateId) {
      console.error('Access token or template ID is missing');
      
      // Display an alert to the user
      <Alert>
        <AlertTitle>Failed to create envelope.</AlertTitle>
        <AlertDescription>Access token or template ID is missing</AlertDescription>
      </Alert>

      return;
    }
  
    setIsLoading(true);

    try {
      const response = await fetch('/api/create-envelope', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: docusignAccessToken,
          templateId: templateId,
          recipientDetails: {
            sendingParty: {
              email: 'signifyaiapp@gmail.com',
              name: 'Miss D. Meanor',
            },
            receivingParty: {
              email: 'yattish@gmail.com',
              name: 'Johnathan Snow',
              receivingReason: 'For the purposes of analysing and predicting trends in the market to analyze the fluctuations of the metaverse.',
            },
          },
          fieldValues: {
            projectName: 'Project ABC',
            startDate: '2023-03-01',
            companyName: 'ABC Incoporated'
          },
          accountId: '32080310', // Replace with dynamic value
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create envelope');
      }
  
      const data = await response.json();
      console.log('Envelope ID:', data.envelopeId);

      <Alert>
        <AlertTitle>Envelope created successfully!</AlertTitle>
        <AlertDescription>Envelope ID: {data.envelopeId}</AlertDescription>
      </Alert>

    } catch (error) {
      console.error('Error creating envelope:', error);
      
      <Alert>
        <AlertTitle>Failed to create envelope</AlertTitle>        
      </Alert>
    } finally {
      setIsLoading(false);
    }
  };  

  return (
    <div className="flex h-full flex-col">
      {/* Buttons toolbar */}
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size="icon" disabled={!thread}>
            <Archive className="size-4" />
          </Button>
          <Button variant={"ghost"} size="icon" disabled={!thread}>
            <ArchiveX className="size-4" />
          </Button>
          <Button variant={"ghost"} size="icon" disabled={!thread}>
            <Trash2Icon className="size-4" />
          </Button>
        </div>
        <Separator orientation="vertical" className="ml-2" />
        <Button
          className="ml-2"
          variant={"ghost"}
          size="icon"
          disabled={!thread}
        >
          <Clock className="size-4" />
        </Button>
        <Separator orientation="vertical" className="ml-2" />
        
        {/* Docusign Connect Button */}
        <Button
          className="ml-2 flex items-center"
          variant={"outline"}
          onClick={handleDocuSignAuth}
          disabled={isProcessing}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <CloudCogIcon className="mr-2" />
          )}           
          DocuSign Connect
        </Button>

        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                asChild
                className="ml-2"
                variant={"ghost"}
                size="icon"
                disabled={!thread}
              >
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="cursor-pointer" onClick={handleGetTemplateDetails}>Get template</DropdownMenuLabel>
              <DropdownMenuLabel className="cursor-pointer" onClick={handleCreateEnvelope}>Create Envelope</DropdownMenuLabel>
              <DropdownMenuLabel className="cursor-pointer">Mark as unread</DropdownMenuLabel>
              <DropdownMenuItem className="cursor-pointer">Star thread</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Add label</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />
      {isSearching ? (
        <SearchDisplay />
      ) : (
        <>
          {thread ? (
            <>
              {/* Display the thread */}
              <div className="flex flex-1 flex-col overflow-scroll">
                <div className="flex items-center p-4">
                  <div className="flex items-center gap-4 text-sm">
                    <Avatar>
                      <AvatarImage alt="avatar" />
                      <AvatarFallback>
                        {
                        thread.emails[0]?.from?.name
                          ?.split(" ")
                          .map((chunk) => chunk[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="font-semibold">
                        {thread.emails[0]?.from?.name}
                        <div className="line-clamp-1 text-xs">
                          {thread.emails[0]?.subject}
                        </div>

                        {/* Reply To */}
                        <div className="line-clamp-1 text-xs">
                          <span className="font-medium">Reply-To:</span>
                          {thread.emails[0]?.from?.address}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sent At Email Date */}
                  {thread.emails[0]?.sentAt && (
                    <div className="ml-auto text-xs text-muted-foreground">
                      {format(new Date(thread.emails[0]?.sentAt), "PPpp")}
                    </div>
                  )}
                </div>

                <Separator />
                <div className="flex max-h-[calc(100vh-500px)] flex-col overflow-scroll">
                  <div className="flex flex-col gap-4 p-6">
                    {
                    thread.emails.map((email) => {
                      return <EmailDisplay key={email.id} email={email} />;
                    })}
                  </div>
                </div>

                <div className="flex-1">
                  <Separator className="mt-auto" />
                  <ReplyBox />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* No message selected */}
              <div className="p-8 text-center text-muted-foreground">
                No message selected.
              </div>
            </>
          )}
        </>
      )}

      {/* Threads Display */}
    </div>
  );
};

export default ThreadDisplay;
