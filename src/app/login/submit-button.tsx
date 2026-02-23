// src/app/login/submit-button.tsx
'use client'

import { useFormStatus } from 'react-dom'
import { ComponentProps } from 'react'

type Props = ComponentProps<'button'> & {
  pendingText?: string
}

export function SubmitButton({ children, pendingText, ...props }: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      {...props}
      disabled={pending}
      className={`${props.className} ${
        pending ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 transition-opacity'
      }`}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          {/* ローディング用のスピナーアイコン */}
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {pendingText || '処理中...'}
        </span>
      ) : (
        children
      )}
    </button>
  )
}