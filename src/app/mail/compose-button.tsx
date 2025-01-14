"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast, useToast } from "@/hooks/use-toast";
import { PencilIcon } from "lucide-react";
import EmailEditor from "./email-editor";
import { useState } from "react";
import { api } from "@/trpc/react";
import useThreads from "../hooks/use-threads";

const ComposeButton = () => {
  const [open, setOpen] = useState(false);
  const [toValues, setTovalues] = useState<{ label: string; value: string }[]>([]);
  const [ccValues, setCCvalues] = useState<{ label: string; value: string }[]>([]);
  const [subject, setSubject] = useState<string>("");

  const { accountId } = useThreads()

  const sendEmail = api.account.sendEmail.useMutation();


  const handleSend = async (value: string) => {
    console.log("Sending...value: ", value);
    if (!accountId) return;

    sendEmail.mutate(
      {
        accountId: accountId,
        threadId: undefined,
        body: value,
        // from: {
        //   name: account?.name ?? "Me",
        //   address: account.emailAddress ?? "me@example.com",
        // },
        from: {
          name: "Me",
          address: "yattish@gmail.com",
        },
        to: toValues.map((to) => ({ name: to.value, address: to.value })),
        cc: ccValues.map((cc) => ({ name: cc.value, address: cc.value })),
        // replyTo: {
        //   name: account?.name ?? "Me",
        //   address: account?.emailAddress ?? "me@example.com",
        // },
        replyTo: {
          name: "Me",
          address: "yattish@gmail.com",
        },
        subject: subject,
        inReplyTo: undefined,
      },
      {
        onSuccess: () => {
          console.log("Email sent successfully");
          toast({
            title: "Signify AI",
            description: "Email Sent!",
          });
          setOpen(false);
        },
        onError: (error) => {
          console.log("Error sending email", error);
          toast({
            title: "Signify AI",
            description: "Error sending email",
          });
        },
      },
    )};

    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button>
            <PencilIcon className="mr-1 size-4" />
            Compose
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Signify AI - Compose Email</DrawerTitle>
          </DrawerHeader>
          <EmailEditor
            toValues={toValues}
            setToValues={setTovalues}
            ccValues={ccValues}
            setCCValues={setCCvalues}
            subject={subject}
            setSubject={setSubject}
            to={toValues.map((to) => to.value)}
            defaultToolbarExpanded={true}
            handleSend={handleSend}
            isSending={sendEmail.isPending}
          />
        </DrawerContent>
      </Drawer>
    );
  };
export default ComposeButton
