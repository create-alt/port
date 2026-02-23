// src/app/projects/[id]/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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
  
  if (!user) return

  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single()
  if (!project) return

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

  const answers: Record<string, string | string[]> = {}
  schema.forEach((q: FormQuestion) => {
    if (q.type === 'checkbox') {
      answers[q.id] = formData.getAll(q.id) as string[]
    } else {
      answers[q.id] = formData.get(q.id) as string
    }
  })

  const { error } = await supabase.from('applications').insert({
    project_id: projectId,
    applicant_id: user.id,
    answers: answers
  })

  if (error) {
    redirect(`/projects/${projectId}?error=true`)
  }

  // ▼ 一覧ページ（トップ）へリダイレクトするように変更
  redirect(`/?success=applied`)
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
  
  // ▼ 一覧ページ（トップ）へリダイレクトするように変更
  redirect(`/?success=updated`)
}

export async function cancelApplication(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const projectId = formData.get('projectId') as string // 今は使わなくなりますが、念のため残しておきます
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('applications').delete().eq('id', applicationId).eq('applicant_id', user.id)
  
  // ▼ 一覧ページ（トップ）へリダイレクトするように変更
  redirect(`/?success=canceled`)
}