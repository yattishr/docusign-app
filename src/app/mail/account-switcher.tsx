"use client"

import { api } from '@/trpc/react'
import React, { useState } from 'react'
import {useLocalStorage} from "usehooks-ts";
import { cn } from "@/lib/utils";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

import { PlusCircle } from 'lucide-react';
import { getAurinkoAuthUrl } from '@/lib/aurinko';
  

type Props = {
    isCollapsed: boolean,
}

const AccountSwitcher = ({isCollapsed}: Props) => {
  const { data }   = api.account.getAccounts.useQuery()
  const [accountId, setAccountId] = useLocalStorage("accountId", "")


  if (!data) return null

  return (
    <Select defaultValue={accountId} onValueChange={setAccountId}>
        <SelectTrigger   className={cn(
            "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
          )} aria-label='Select account'>
            
            <SelectValue placeholder="Choose an account">
                <span className={cn({"hidden": !isCollapsed})}>
                    {data.find(account => account.id === accountId)?.emailAddress[0]}
                </span>

                <span className={cn({"hidden": isCollapsed, "ml-2": true})}>
                {data.find(account => account.id === accountId)?.emailAddress}
                </span>
            </SelectValue>
        </SelectTrigger>

        <SelectContent>
            {data.map((account) => {
                return (
                    <SelectItem key={accountId} value={account.id}>
                        {account.emailAddress}
                    </SelectItem>
                )
            })}
            <div onClick={async () => {
                const authUrl = await getAurinkoAuthUrl("Google")
                window.location.href = authUrl
            }} className='flex relative hover:bg-gray-50 w-full cursor-pointer items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent'>
                <PlusCircle className='size-4 mr-1'/>
                Add Account
            </div>
        </SelectContent>

    </Select>
  )
}

export default AccountSwitcher