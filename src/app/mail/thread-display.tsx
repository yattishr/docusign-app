"use client";
import React from "react";
import useThreads from "../hooks/use-threads";
import { Button } from "@/components/ui/button";
import {
  Archive,
  ArchiveX,
  Clock,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns";
import EmailDisplay from "./email-display";


const ThreadDisplay = () => {
  const { threadId, threads } = useThreads();
  const thread = threads?.find((t) => t.id === threadId);

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

        <div className="ml-auto flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button className="ml-2" variant={"ghost"} size="icon" disabled={!thread}>
                <MoreVerticalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mark as unread</DropdownMenuLabel>
              <DropdownMenuItem>Star thread</DropdownMenuItem>
              <DropdownMenuItem>Add label</DropdownMenuItem>
              <DropdownMenuItem>Mute thread</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Separator />
      {/* Threads Display */}
      {thread ? 
        <>
            {/* Display the thread */}
            <div className="flex flex-col flex-1 overflow-scroll">
                <div className="flex items-center p-4">
                    <div className="flex items-center gap-4 text-sm">
                        <Avatar>
                            <AvatarImage alt="avatar"/>
                            <AvatarFallback>
                                {thread.emails[0]?.from?.name?.split(' ').map(chunk => chunk[0]).join('')}
                            </AvatarFallback>
                            

                        </Avatar>
                        <div className="grid gap-1">
                            <div className="font-semibold">
                                {thread.emails[0]?.from?.name}
                                <div className="text-xs line-clamp-1">
                                    {thread.emails[0]?.subject}
                                </div>

                                {/* Reply To */}
                                <div className="text-xs line-clamp-1">
                                    <span className="font-medium">
                                        Reply-To:
                                    </span>
                                    {thread.emails[0]?.from?.address}
                                </div>                             
                            </div>
                        </div>
                    </div>

                    {/* Sent At Email Date */}
                    {thread.emails[0]?.sentAt && (
                        <div className="ml-auto text-xs text-muted-foreground">
                            {format(new Date(thread.emails[0]?.sentAt), 'PPpp')}
                        </div>
                    )}
                </div>

                <Separator />
                <div className="max-h-[calc(100vh-500px)] overflow-scroll flex flex-col">
                    <div className="p-6 flex flex-col gap-4">
                        {thread.emails.map(email => {
                            return <EmailDisplay key={email.id} email={email} />
                        })}
                    </div>
                </div>

                <div className="flex-1">
                    <Separator className="mt-auto"/>
                    {/* Reply Box */}
                    Reply Box
                </div>

            </div>        
        </> : 

        <>
        {/* No message selected */}
            <div className="p-8 text-center text-muted-foreground">
                No message selected.
            </div>
        </>
      }

    </div>
  );
};

export default ThreadDisplay;