'use client'
import { RouterOutputs } from '@/trpc/react'
import React from 'react'
import useThreads from '../hooks/use-threads'
import { cn } from '@/lib/utils'

type Props = {
    email: RouterOutputs['account']['getThreads'][0]['emails'][0]
}

const EmailDisplay = ({ email }: Props) => {
 const { account } = useThreads()
 const isMe = account?.emailAddress === email.from.address
 

  return (
    // Check if isMe === true and display a border around the email thread
    <div className={
        cn('border rounded-md p-4 transition-all translate-x-2', {
            'border-l-gray-900 border-l-4': isMe
        })
    }>

        <div className='flex items-center justify-between gap-2'>
            <div className='flex items-center justify-between gap-2'>
                <span>{email.from.name}</span>
            </div>
        </div>


    </div>
  )
}

export default EmailDisplay