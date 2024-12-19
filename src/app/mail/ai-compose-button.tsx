"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"

import { Bot, BotIcon } from "lucide-react";
import { useState } from "react";
import { generateEmail } from "./action";
import { readStreamableValue } from "ai/rsc";
import useThreads from "../hooks/use-threads";
import { turndown } from "@/lib/turndown";

type Props = {
  isComposing?: boolean;
  onGenerate: (token: string) => void;
};

const AIComposeButton = (props: Props) => {
  const [ open, setOpen ] = useState(false)
  const [ prompt, setPrompt ] = useState('')
  const { threads, threadId, account } = useThreads()
  const thread = threads?.find(t => t.id === threadId)

  const aiGenerate = async (prompt: string) => {
    let context = ''

    console.log(`Logging incoming prompt: ${prompt} from ai-compose button...`)
    
    if (!props.isComposing) {
      for (const email of thread?.emails ?? []) {
        // construct the context
        const content = `
          Subject: ${email.subject}
          From: ${email.from}
          To: ${email.to}
          Sent: ${new Date(email.sentAt).toLocaleString()}
          Body: ${turndown.turndown(email.body ?? email.bodySnippet ?? '')}
        `

        // now concatenate the context with the content defined above.
        context += content
      }
    }

    context += `My name is ${account?.name} and my email is ${account?.emailAddress}`
    console.log(`Logging out the context: ${context}`)

    const { output } = await generateEmail(context, prompt)

    for await (const token of readStreamableValue(output)) {      
      if (token) {        
        console.log(`${token}`)
        props.onGenerate(token)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size='icon' variant={'outline'} onClick={() => setOpen(true)}>
            <BotIcon className="size-5"/>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>AI Smart Compose</DialogTitle>
          <DialogDescription>
            Use AI Smart Compose to compose your email.
          </DialogDescription>
          <div className="h-2"></div>
          <Textarea 
            placeholder="Tell AI Smart Componse what to do..."
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            />
          <div className="h-2"></div>
          <Button onClick={() => { aiGenerate(prompt); setOpen(false); setPrompt('') }}>Generate</Button>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AIComposeButton;
