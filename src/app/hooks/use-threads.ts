import { api } from '@/trpc/react'
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'

const useThreads = () => {
 const {data: accounts} = api.account.getAccounts.useQuery()
 const [ accountId ] = useLocalStorage("accountId", "")
 const [ tab ] = useLocalStorage("tabValue", "inbox")
 const [ done ] = useLocalStorage("doneValue", false)

 const { data: threads, isFetching, refetch } = api.account.getThreads.useQuery({
    accountId,
    tab,
    done
 }, {
    enabled: !!accountId && !!tab, 
    placeholderData: e => e, refetchInterval: 5000,
 })
 
 return {
    threads,
    isFetching,
    refetch,
    accountId,
    account: accounts?.find(e => e.id === accountId)
 }



}

export default useThreads