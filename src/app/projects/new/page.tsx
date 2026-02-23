// src/app/projects/new/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createProject } from './actions'
import { SubmitButton } from '@/app/login/submit-button'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // プロフィールが設定されているかチェック（ご要望4の対応）
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // プロフィールがなければ強制リダイレクト
    redirect('/profile?message=プロフィールを設定してから募集を行ってください')
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline text-sm">
          ← トップページに戻る
        </Link>
        <h1 className="text-3xl font-bold mt-4">新規プロジェクトの募集</h1>
      </div>

      <form action={createProject} className="flex flex-col gap-6 bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-semibold text-gray-700">プロジェクト名・募集タイトル</label>
          <input id="title" name="title" type="text" required className="border p-3 rounded-md" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="skills" className="font-semibold text-gray-700">求める技術・スキル（カンマ区切り）</label>
          <input id="skills" name="skills" type="text" className="border p-3 rounded-md" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="font-semibold text-gray-700">プロジェクトの詳細</label>
          <textarea id="description" name="description" required rows={5} className="border p-3 rounded-md resize-none" />
        </div>

        {/* 連絡手段の追加（ご要望3の対応） */}
        <div className="flex flex-col gap-2">
          <label htmlFor="contact_info" className="font-semibold text-gray-700">連絡手段</label>
          <input 
            id="contact_info" 
            name="contact_info" 
            type="text" 
            required
            placeholder="例: X (旧Twitter) のDM: @your_id、またはメール: xxx@example.com"
            className="border p-3 rounded-md" 
          />
        </div>

        <div className="mt-4">
          <SubmitButton pendingText="公開中..." className="w-full bg-blue-600 text-white p-3 rounded-md font-bold text-lg">
            募集を公開する
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}