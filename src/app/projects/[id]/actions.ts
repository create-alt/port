// src/app/projects/[id]/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ▼ フォーム設問の型（これを追加）
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

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) return

  const answers: Record<string, string | string[]> = {}
  
  // ▼ any を排除し、FormQuestion[] 型を指定
  const schema: FormQuestion[] = project.form_schema || []

  // ▼ any を FormQuestion に変更
  schema.forEach((q: FormQuestion) => {
    if (q.type === 'checkbox') {
      answers[q.id] = formData.getAll(q.id) as string[]
    } else {
      answers[q.id] = formData.get(q.id) as string
    }
  })

  const { error } = await supabase
    .from('applications')
    .insert({
      project_id: projectId,
      applicant_id: user.id,
      answers: answers
    })

  if (error) {
    console.error('申し込み保存エラー:', error)
    redirect(`/projects/${projectId}?error=true`)
  }

  // --- メール通知処理 ---
  try {
    const { data: applicantProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
      
    const applicantName = applicantProfile?.display_name || '名無し'
    const mailSubject = '新しい申し込みがありました'
    const mailBody = `${applicantName}さんが『${project.title}』に申し込みました`

    console.log('【システム通知】', mailBody)
  } catch (mailError) {
    console.error('メール送信中にエラーが発生しましたが、申し込みは完了しています:', mailError)
  }

  revalidatePath('/')
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)
}

export async function cancelApplication(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const projectId = formData.get('projectId') as string
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', applicationId)
    .eq('applicant_id', user.id)

  if (error) {
    console.error('申し込み取消エラー:', error)
  }

  revalidatePath('/')
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)

  
}

export async function updateApplication(formData: FormData) {
  const applicationId = formData.get('applicationId') as string
  const projectId = formData.get('projectId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (!project) return

  const answers: Record<string, string | string[]> = {}
  const schema: FormQuestion[] = project.form_schema || []

  schema.forEach((q: FormQuestion) => {
    if (q.type === 'checkbox') {
      answers[q.id] = formData.getAll(q.id) as string[]
    } else {
      answers[q.id] = formData.get(q.id) as string
    }
  })

  // 既存のデータを UPDATE（上書き）する
  const { error } = await supabase
    .from('applications')
    .update({ answers: answers })
    .eq('id', applicationId)
    .eq('applicant_id', user.id)

  if (error) {
    console.error('申し込み更新エラー:', error)
  }

  revalidatePath('/')
  revalidatePath(`/projects/${projectId}`)
  redirect(`/projects/${projectId}`)
}