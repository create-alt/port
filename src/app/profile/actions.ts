// src/app/profile/actions.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const display_name = formData.get('display_name') as string
  const school = formData.get('school') as string
  const bio = formData.get('bio') as string
  const skillsString = formData.get('skills') as string
  
  // ▼ 画像ファイルの取得
  const avatarFile = formData.get('avatar') as File | null

  const skills = skillsString
    .split(',')
    .map((skill) => skill.trim())
    .filter((skill) => skill !== '')

  // まず現在のプロフィールを取得（既存のアイコンURLを保持するため）
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', user.id)
    .single()

  let avatar_url = currentProfile?.avatar_url

  // 新しい画像がアップロードされた場合の処理
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${user.id}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, { upsert: true })

    if (uploadError) {
      console.error('画像アップロードエラー:', uploadError)
    } else {
      // 公開URLを取得
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)
      avatar_url = publicUrlData.publicUrl
    }
  }

  // DBの更新
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      display_name,
      school,
      bio,
      skills,
      avatar_url, // 画像URLを追加
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('プロフィールの保存に失敗しました:', error)
    redirect('/profile?error=true')
  }

  revalidatePath('/')
  revalidatePath('/profile')
  redirect('/')
}