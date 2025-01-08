'use client'

import DOMPurify from 'dompurify';
import { useAtom } from 'jotai'
import React, { useEffect } from 'react'
import { searchValueAtom } from './search-bar'
import { api } from "@/trpc/react";
import { useDebounceValue, useLocalStorage } from 'usehooks-ts'
import useThreads from '@/app/hooks/use-threads';

const SearchDisplay = () => {
  const [searchValue] = useAtom(searchValueAtom)  
  const search = api.account.searchEmails.useMutation();
  const [debouncedSearchValue] = useDebounceValue(searchValue, 500)
  const { accountId } = useThreads()

  useEffect(() => {
    console.log('searching for', debouncedSearchValue)
    
    // return if the search value is empty or the account id is not set
    if (!accountId) return

    // Logging the search value and account id
    console.log('search.mutate called with:', { accountId, query: debouncedSearchValue });

    // search the account for the search value
    search.mutate({
      accountId,
      query: debouncedSearchValue
    })
  }, [debouncedSearchValue, accountId])

  return (
    <div className='p-4 max-h-[calc(100vh-50px)] overflow-y-scroll'>
        <div className='flex items-center gap-2 mb-4'>
            <h2 className='text-gray-800 text-sm dark:text-gray-400'>
                Your search query for &quot;{searchValue}&quot; returned {search.data?.hits.length} results...
            </h2>
        </div>

        {/* Display Search Results... */}
        {search.data?.hits.length === 0 ? (
        <>
          <p>No results found for {debouncedSearchValue}</p>
        </>) :         
        <>
          <ul className='flex flex-col gap-2'>
            {search.data?.hits.map(hit => (
              // display the returned reults in an html list
              <li key={hit.id} className='border list-none rounded-md p-4 hover:bg-gray-100 cursor-pointer transition-all dark:hover:bg-gray-900'>
                <h3 className='text-base font-medium'>
                  {hit.document.subject}
                </h3>
                <p className='text-sm text-gray-500'>
                  From: {hit.document.from}
                </p>

                <p className='text-sm text-gray-500'>
                  To: {hit.document.to.join(', ')}
                </p>

                <p className='text-sm mt-2' dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(hit.document.rawBody, {USE_PROFILES: {html: true}})
                }}>                
                </p>

              </li>

            ))}
          </ul>
          
        </>}
    </div>
  )
}

export default SearchDisplay