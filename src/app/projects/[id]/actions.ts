// src/app/projects/[id]/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// ▼ 型定義を追加
type FormQuestion = {
  id: string
  type: 'text' | 'radio' | 'checkbox'
  label: string
  options?: string
}

export async function applyToProject(formData: FormData) {
  console.log('【1】申し込み処理スタート')
  const projectId = formData.get('projectId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('【エラー】ユーザーが未ログインです')
    return
  }

  console.log('【2】プロジェクト情報取得')
  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()
  if (!project) return

  // ▼ any を排除し FormQuestion[] を使用
  let schema: FormQuestion[] = []
  if (Array.isArray(project.form_schema)) {
    schema = project.form_schema
  } else if (typeof project.form_schema === 'string') {
    try { 
      const parsed = JSON.parse(project.form_schema)
      schema = Array.isArray(parsed) ? parsed : [] 
    } catch (e) {
      schema = []
    }
  }

  // ▼ any を排除
  const answers: Record<string, string | string[]> = {}
  schema.forEach((q: FormQuestion) => {
    if (q.type === 'checkbox') {
      answers[q.id] = formData.getAll(q.id) as string[]
    } else {
      answers[q.id] = formData.get(q.id) as string
    }
  })

  console.log('【3】データベースへ保存実行')
  const { error } = await supabase.from('applications').insert({
    project_id: projectId,
    applicant_id: user.id,
    answers: answers
  })

  if (error) {
    console.log('【エラー】保存失敗:', error.message)
    redirect(`/projects/${projectId}?error=true`)
  }

  console.log('【4】保存成功！画面を切り替えます')
  // エラーの原因になりやすい revalidatePath を削除し、一発でリダイレクトさせます
  redirect(`/projects/${projectId}?success=${Date.now()}`)
}

export async function updateApplication(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const projectId = formData.get('projectId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()
  
  let schema: FormQuestion[] = []
  if (Array.isArray(project?.form_schema)) {
    schema = project!.form_schema
  } else if (typeof project?.form_schema === 'string') {
    try { 
      const parsed = JSON.parse(project.form_schema)
      schema = Array.isArray(parsed) ? parsed : [] 
    } catch (e) {
      schema = []
    }
  }

  const answers: Record<string, string | string[]> = {}
  schema.forEach((q: FormQuestion) => {
    if (q.type === 'checkbox') {
      answers[q.id] = formData.getAll(q.id) as string[]
    } else {
      answers[q.id] = formData.get(q.id) as string
    }
  })

  await supabase.from('applications').update({ answers }).eq('id', applicationId).eq('applicant_id', user.id)
  redirect(`/projects/${projectId}?updated=${Date.now()}`)
}

export async function cancelApplication(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const projectId = formData.get('projectId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('applications').delete().eq('id', applicationId).eq('applicant_id', user.id)
  redirect(`/projects/${projectId}?canceled=${Date.now()}`)
}