import React, { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Text } from '@tiptap/extension-text'
import EditorMenuBar from './editor-menubar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from "@/components/ui/input"

import TagInput from './tag-input'
import AIComposeButton from './ai-compose-button'
import { generate } from './action'
import { readStreamableValue } from 'ai/rsc'
import { PencilIcon, SendIcon, SparkleIcon } from 'lucide-react'
import { useLocalStorage } from 'usehooks-ts'

type Props = {
    subject: string
    setSubject: (value: string) => void

    toValues: { label: string, value: string}[]
    setToValues: (value: {label: string, value: string}[]) => void

    ccValues: { label: string, value: string}[]
    setCCValues: (value: {label: string, value: string}[]) => void

    to: string[]

    handleSend: (value: string) => void
    isSending: boolean

    defaultToolbarExpanded?: boolean
}

const EmailEditor = ({subject, setSubject, toValues, setToValues, ccValues, setCCValues, to, handleSend, isSending, defaultToolbarExpanded = false}: Props) => {
  const [value, setValue] = useState<string>('')
  const [expanded, setExpanded] = useState<boolean>(defaultToolbarExpanded)
  const [ token, setToken ] = useState<string>('')
  const [ accountId ] = useLocalStorage('accountId', '');

  const [generation, setGeneration] = useState('')

  const aiGenerate = async (prompt: string) => {
    const { output } = await generate(prompt)
    for await (const token of readStreamableValue(output)) {
      if (token) {
        setToken(token)        
      }
    }
  }

  const CustomText = Text.extend({
    addKeyboardShortcuts() {
        return {
            'Meta-m': () => {
                console.log('Meta-m')
                aiGenerate(this.editor.getText())
                return true
            }
        }
    },
  })

  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit, CustomText],
    onUpdate: ({ editor }) => {
        setValue(editor.getHTML())
    }
  })   

  useEffect(() => {
    editor?.commands.insertContent(token)
  }, [editor, token])

  const onGenerate = (token: string) => {    
    editor?.commands?.insertContent(token)
  }

  if (!editor) return null

  return (
    <div>
      <div className="flex border-b p-4 py-2">
        <EditorMenuBar editor={editor} />
      </div>

      <div className="space-y-2 p-4 pb-0">
        {expanded && (
          <>
            <TagInput
              label="To: "
              placeholder="Add Recipients"
              onChange={setToValues}
              // @ts-ignore
              value={toValues}
            />

            <TagInput              
              label="CC: "
              placeholder="Add Recipients"
              onChange={setCCValues}
              // @ts-ignore
              value={ccValues}
            />

            <Input id='subject' placeholder='Subject' value={subject} onChange={(e) => setSubject(e.target.value)} />
          </>
        )}

        <div className="flex items-center gap-2">
          <div className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
            <span className="font-medium text-green-600">Click to expand {" "} </span>
            <span>to {to.join(', ')}</span>
          </div>

          {/* Compose with AI button */}
          <AIComposeButton isComposing={defaultToolbarExpanded} onGenerate={onGenerate} />
        </div>
      </div>

      <div className="prose w-full px-4 border border-green-100 h-45 bg-white rounded-md shadow-md">
        <EditorContent className='h-full p-4' editor={editor} value={value} />
      </div>

      <Separator />

      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm">
          Tip: Press{" "}
          <kbd className="rounded-lg border border-gray-200 bg-gray-100 px-2 py-1.5 text-xs font-semibold text-gray-800">
            Cmd + M
          </kbd>{" "}
          for AI autocomplete
        </span>
        
        <div className='flex flex-row gap-3'>
          <Button onClick={() => aiGenerate(editor.getText())}>
            <SparkleIcon />
            AI Complete
          </Button>

          <Button
              onClick={async() => {
                  editor?.commands?.clearContent()
                  await handleSend(value)
              }}
              disabled={isSending}>
                <SendIcon />
          Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default EmailEditor