// src/app/profile/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  // ログインユーザーの取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // フォームデータの取得
  const display_name = formData.get('display_name') as string
  const school = formData.get('school') as string
  const bio = formData.get('bio') as string
  const skillsString = formData.get('skills') as string

  // カンマ区切りの文字列を配列に変換
  const skills = skillsString
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill !== '')

  // Supabaseのprofilesテーブルにアップサート（あれば更新、なければ挿入）
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id, // Primary KeyであるユーザーIDを指定
      display_name,
      school,
      bio,
      skills,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('プロフィールの保存に失敗しました:', error)
    redirect('/profile?error=true')
  }

  // キャッシュを破棄してトップページへリダイレクト
  revalidatePath('/')
  revalidatePath('/profile')
  redirect('/')
}