"use client";
import React from "react";
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
import { format } from "date-fns";
import EmailDisplay from "./email-display";
import ReplyBox from "./reply-box";
import { useAtom } from "jotai";
import { isSearchingAtom } from "@/components/mail/search-bar";
import SearchDisplay from "@/components/mail/search-display";
import { useRouter } from "next/navigation";
import { useLocalStorage } from 'usehooks-ts';

// Docusign function call
import { getTemplateDetails } from '@/lib/docusign';

const ThreadDisplay = () => {
  const { threadId, threads } = useThreads();
  // @ts-ignore
  const thread = threads?.find((t) => t.id === threadId);
  const [isSearching] = useAtom(isSearchingAtom);
  const [docusignAccessToken] = useLocalStorage('docusignAccessToken', '');

  // For the purposes of testing we hard code our template Id.
  const templateId = 'e1b8bcf9-bdcb-46a8-b308-070f601191d0'; // Replace with the actual template ID  
  
  const handleDocuSignAuth = () => {
    const clientId = process.env.NEXT_PUBLIC_DS_CLIENT_ID
    const redirectUri = encodeURIComponent('http://localhost:3000/mail')
    const docusignUrl = `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature&client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = docusignUrl
  }

  const handleGetTemplateDetails = async () => {
    
    try {
      const templateDetails = await getTemplateDetails({ templateId, accessToken: docusignAccessToken });
      console.log('Template Details:', JSON.stringify(templateDetails));

      // Handle the template details as needed
    } catch (error) {
      console.error('Error fetching template details:', error);
    }
  };

  const handleCreateEnvelope = async () => {
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
            email: 'absolutesportsfan@gmail.com',
            name: 'Sending Party Name',
          },
          receivingParty: {
            email: 'yattish@gmail.com',
            name: 'Receiving Party Name',
          },
        },
        fieldValues: {
          projectName: 'Project ABC',
          startDate: '2023-01-01',
        },
        accountId: 'your-account-id',
      }),
    });
  
    const data = await response.json();
    console.log('Envelope ID:', data.envelopeId);
  }

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
        >
          <CloudCogIcon className="mr-2" />
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
                          // @ts-ignore
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
                    // @ts-ignore
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
