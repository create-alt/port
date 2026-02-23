// src/app/login/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    // ▼ この1行を追加 ▼
    console.error('【ログインエラー】:', error.message)
    redirect('/login?error=true')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('【新規登録エラー】:', error.message)
    redirect('/login?error=true')
  }

  // ▼ ここを変更：登録成功時は、ログイン画面にメッセージ付きで戻す ▼
  redirect('/login?message=登録したメールアドレスに確認メールを送信しました。メール内のリンクをクリックして認証を完了してください。')
}