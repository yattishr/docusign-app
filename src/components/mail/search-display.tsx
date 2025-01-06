'use client'

import { useAtom } from 'jotai'
import React, { useEffect } from 'react'
import { searchValueAtom } from './search-bar'
import { api } from "@/trpc/react";
import { useDebounceValue } from 'usehooks-ts'

const SearchDisplay = () => {
  const [searchValue] = useAtom(searchValueAtom)  
 

  const search = api.account.searchEmails.useMutation();
  const [debouncedSearchValuee] = useDebounceValue(searchValue, 500)

  useEffect(() => {
    console.log('searching for', debouncedSearchValuee)
  }, [debouncedSearchValuee])

  return (
    <div className='p-4 max-h-[calc(100vh-50px)] overflow-y-scroll'>
        <div className='flex items-center gap-2 mb-4'>
            <h2 className='text-gray-800 text-sm dark:text-gray-400'>
                Your search query for &quot;{searchValue}&quot; returned results...
            </h2>
        </div>

    </div>
  )
}

export default SearchDisplay