'use client'

import DOMPurify from 'dompurify';
import { useAtom } from 'jotai'
import React, { useEffect } from 'react'
import { searchValueAtom } from './search-bar'
import { api } from "@/trpc/react";
import { useDebounceValue } from 'usehooks-ts'
import useThreads from '@/app/hooks/use-threads';

const SearchDisplay = () => {
  const [searchValue] = useAtom(searchValueAtom)  
  const search = api.account.searchEmails.useMutation();
  const [debouncedSearchValue] = useDebounceValue(searchValue, 500)
  const { accountId } = useThreads()

  useEffect(() => {
    console.log('searching for', debouncedSearchValue)
    if (debouncedSearchValue) {
      search.mutate({ accountId, query: debouncedSearchValue });
    }
  }, [debouncedSearchValue, accountId, search])

  return (
    <div>
      {search.data?.hits.map((hit, index) => (
        <div key={index}>
          <h3>{hit.document.subject}</h3>
          <p>{hit.document.body}</p>
          <p>
            To: {Array.isArray(hit.document.to) ? hit.document.to.join(', ') : hit.document.to}
          </p>
        </div>
      ))}
    </div>
  )
}

export default SearchDisplay