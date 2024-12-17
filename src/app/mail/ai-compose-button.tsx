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

type Props = {
  isComposing?: boolean;
  onGenerate: (token: string) => void;
};

const AIComposeButton = (props: Props) => {
  const [ open, setOpen ] = useState(false)
  const [ prompt, setPrompt ] = useState('')

  const aiGenerate = async (prompt: string) => {
    console.log(`Logging incoming prompt: ${prompt} from ai-compose button...`)
    const { output } = await generateEmail('', prompt)

    for await (const token of readStreamableValue(output)) {      
      if (token) {        
        console.log(`${token}`)
        props.onGenerate(token)
      }
    }
  }

  return (
    <Dialog>
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
