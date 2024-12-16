'use client'
import React, { useEffect, useState } from 'react'
import EmailEditor from './email-editor'
import { Separator } from '@/components/ui/separator'
import { api, RouterOutputs } from '@/trpc/react'
import useThreads from '../hooks/use-threads'

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
  
  const handleSend = async (value: string) => {
    console.log("Sending...", value)
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
          isSending={false}
        />
  )
}

export default ReplyBox