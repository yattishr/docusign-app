import { api } from '@/trpc/react'
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { atom, useAtom } from 'jotai'
import { getQueryKey } from '@trpc/react-query'

export const threadIdAtom = atom<string | null>(null)

const useThreads = () => {
 const {data: accounts} = api.account.getAccounts.useQuery()
 const [ accountId ] = useLocalStorage("accountId", "")
 const [ tab ] = useLocalStorage("tabValue", "inbox")
 const [ done ] = useLocalStorage("doneValue", false)
 const [threadId, setThreadId] = useAtom(threadIdAtom)

 const queryKey = getQueryKey(api.account.getThreads,{ accountId, tab, done }, 'query')
 const { data: threads, isFetching, refetch } = api.account.getThreads.useQuery({
    accountId,
    tab,
    done
 }, {
    enabled: !!accountId && !!tab, 
    placeholderData: (e) => e, refetchInterval: 20000,
 })
 
 return {
    threads,
    isFetching,
    refetch,
    accountId,
    threadId, 
    setThreadId,
    account: accounts?.find((e) => e.id === accountId),
    accounts,
    queryKey,
 }
}

export default useThreads