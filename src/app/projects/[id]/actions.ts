// src/app/projects/[id]/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type FormQuestion = {
  id: string
  type: 'text' | 'radio' | 'checkbox'
  label: string
  options?: string
}

export async function applyToProject(formData: FormData) {
  const projectId = formData.get('projectId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()
  if (!project) return

  // 安全に設問データを読み込むバリア
  let schema: FormQuestion[] = []
  if (Array.isArray(project.form_schema)) {
    schema = project.form_schema
  } else if (typeof project.form_schema === 'string') {
    try { schema = JSON.parse(project.form_schema); schema = Array.isArray(schema) ? schema : [] } catch (e) {}
  }

  const answers: Record<string, string | string[]> = {}
  schema.forEach((q: FormQuestion) => {
    if (q.type === 'checkbox') {
      answers[q.id] = formData.getAll(q.id) as string[]
    } else {
      answers[q.id] = formData.get(q.id) as string
    }
  })

  // データベースに保存（ここで成功している）
  const { error } = await supabase.from('applications').insert({
    project_id: projectId,
    applicant_id: user.id,
    answers: answers
  })

  if (error) {
    console.error('申し込み保存エラー:', error)
    redirect(`/projects/${projectId}?error=true`)
  }

  // Next.jsのキャッシュをすべて破棄し、URLに「?success=true」を付けて強制リロードさせる！
  revalidatePath('/', 'layout')
  redirect(`/projects/${projectId}?success=true`)
}

export async function updateApplication(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const projectId = formData.get('projectId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()
  if (!project) return

  let schema: FormQuestion[] = []
  if (Array.isArray(project.form_schema)) {
    schema = project.form_schema
  } else if (typeof project.form_schema === 'string') {
    try { schema = JSON.parse(project.form_schema); schema = Array.isArray(schema) ? schema : [] } catch (e) {}
  }

  const answers: Record<string, string | string[]> = {}
  schema.forEach((q: FormQuestion) => {
    if (q.type === 'checkbox') {
      answers[q.id] = formData.getAll(q.id) as string[]
    } else {
      answers[q.id] = formData.get(q.id) as string
    }
  })

  await supabase.from('applications').update({ answers: answers }).eq('id', applicationId).eq('applicant_id', user.id)

  revalidatePath('/', 'layout')
  redirect(`/projects/${projectId}?updated=true`)
}

export async function cancelApplication(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const projectId = formData.get('projectId') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('applications').delete().eq('id', applicationId).eq('applicant_id', user.id)

  revalidatePath('/', 'layout')
  redirect(`/projects/${projectId}?canceled=true`)
}