// src/app/projects/new/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  // ログインユーザーの取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // フォームデータの取得
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const skillsString = formData.get('skills') as string

  // カンマ区切りの文字列を配列に変換し、前後の空白を削除
  const required_skills = skillsString
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill !== '') // 空白のみの要素を除外

  // Supabaseのprojectsテーブルに挿入
  const { error } = await supabase
    .from('projects')
    .insert({
      author_id: user.id, // 作成者のIDとしてログインユーザーのIDをセット
      title,
      description,
      required_skills,
    })

  if (error) {
    console.error('プロジェクトの作成に失敗しました:', error)
    // エラー時はパラメータをつけて元の画面に戻す
    redirect('/projects/new?error=true')
  }

  // トップページのキャッシュを破棄して最新情報を取得し直す
  revalidatePath('/')
  
  // トップページへリダイレクト
  redirect('/')
}