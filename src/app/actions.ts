// src/app/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProject(formData: FormData) {
  const projectId = formData.get('projectId') as string
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  // 自分のプロジェクトのみ削除する
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('author_id', user.id)

  if (error) {
    console.error('削除エラー:', error)
  }

  // 削除後にトップページを更新
  revalidatePath('/')
}