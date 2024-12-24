'use client'
import React, { useEffect, useState } from 'react'
import EmailEditor from './email-editor'
import { Separator } from '@/components/ui/separator'
import { api, RouterOutputs } from '@/trpc/react'
import useThreads from '../hooks/use-threads'
import { toast, useToast } from "@/hooks/use-toast"


const ReplyBox = () => {
  const { threadId, accountId } = useThreads()
  const { data: replyDetails } = api.account.getReplyDetails.useQuery({
    threadId: threadId ?? "", 
    accountId
  })

  if (!replyDetails) return null;

  return <Component replyDetails={replyDetails} />

}

const Component = ({ replyDetails }: { replyDetails: RouterOutputs['account']['getReplyDetails'] }) => {
  const { threadId, accountId } = useThreads()

  const [ subject, setSubject ] = useState(replyDetails.subject.startsWith("Re:") ? replyDetails.subject : `Re: ${replyDetails.subject}`)

  const [ toValues, setToValues ] = useState<{ label: string, value: string }[]>(replyDetails.to.map(to => ({ label: to.address, value: to.address })))

  const [ ccValues, setCCValues ] = useState<{ label: string, value: string }[]>(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address })))

  useEffect(() => {
    if (!threadId || !replyDetails) return

    if (!replyDetails.subject.startsWith("Re:")) {
      setSubject(`Re: ${replyDetails.subject}`)
    } else {
      setSubject(replyDetails.subject)
    }

    setToValues(replyDetails.to.map(to => ({ label: to.address, value: to.address})))
    setCCValues(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address})))

  }, [threadId, replyDetails])
  
  // invoke the sendEmail function defined in: api\routers\accounts.ts
  const sendEmail = api.account.sendEmail.useMutation()

  // handleSend function to send email
  const handleSend = async (value: string) => {
    if (!replyDetails) return
    sendEmail.mutate({
      accountId, 
      threadId: threadId ?? undefined,
      body: value,
      subject,
      from: replyDetails.from,
      to: (replyDetails.to ?? []).map(to => ({ address: to.address ?? '', name: to.name ?? '' })),
      cc: replyDetails.cc.map(cc => ({ address: cc.address ?? '', name: cc.name ?? '' })),
      replyTo: replyDetails.from,
      inReplyTo: replyDetails.id,
    }, {
      onSuccess: () => {
        toast({
          title: "Signify AI",
          description: "Email Sent!",
        })
        console.log("Email sent")
      },
      onError: (error) => {
        console.log("Error sending email", error)
        toast({
          title: "Signify AI",
          description: "Error sending email",
        })
      }
    })
  }

  return (
        <EmailEditor 
          subject={subject}
          setSubject={setSubject}

          toValues={toValues}
          setToValues={setToValues}

          ccValues={ccValues}
          setCCValues={setCCValues}

          to={replyDetails.to.map(to => to.address)}       
          
          handleSend={handleSend}
          isSending={sendEmail.isPending}
        />
  )
}

export default ReplyBox