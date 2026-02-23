// src/app/projects/new/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const skillsString = formData.get('skills') as string
  const contact_info = formData.get('contact_info') as string
  const form_schema = JSON.parse(formData.get('form_schema') as string || '[]') // ← これを追加

  const required_skills = skillsString
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill !== '')

  const { error } = await supabase
    .from('projects')
    .insert({
      author_id: user.id,
      title,
      description,
      required_skills,
      contact_info,
      form_schema, // ← これを追加
    })

  if (error) {
    console.error('プロジェクトの作成に失敗しました:', error)
    redirect('/projects/new?error=true')
  }

  revalidatePath('/')
  // 保存成功後、元の画面（トップページ）に遷移します（ご要望1の対応）
  redirect('/')
}