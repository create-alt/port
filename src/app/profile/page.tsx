// src/app/profile/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from './actions'
import { SubmitButton } from '@/app/login/submit-button'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 現在のプロフィール情報を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline text-sm">
          ← トップページに戻る
        </Link>
        <h1 className="text-3xl font-bold mt-4">プロフィール設定</h1>
        <p className="text-gray-600 mt-2">
          あなたのスキルや興味のある分野を登録して、マッチングのきっかけを作りましょう。
        </p>
      </div>

      <form action={updateProfile} className="flex flex-col gap-6 bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
        
        {/* 表示名 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="display_name" className="font-semibold text-gray-700">表示名・ニックネーム</label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            defaultValue={profile?.display_name || ''}
            placeholder="例: 高専太郎"
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 学校名 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="school" className="font-semibold text-gray-700">所属学校・キャンパス</label>
          <input
            id="school"
            name="school"
            type="text"
            defaultValue={profile?.school || ''}
            placeholder="例: 〇〇工業高等専門学校"
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* スキル */}
        <div className="flex flex-col gap-2">
          <label htmlFor="skills" className="font-semibold text-gray-700">得意な技術・持っているスキル（カンマ区切り）</label>
          <input
            id="skills"
            name="skills"
            type="text"
            defaultValue={profile?.skills?.join(', ') || ''}
            placeholder="例: Python, C++, React, 3Dモデリング"
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 自己紹介文 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="bio" className="font-semibold text-gray-700">自己紹介・やりたいこと</label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={profile?.bio || ''}
            placeholder="例: ロボット工学研究部に所属しています。ハードウェアは得意ですが、WebアプリのUI開発ができる人を探しています！"
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* 送信ボタン */}
        <div className="mt-4">
          <SubmitButton 
            pendingText="保存中..."
            className="w-full bg-blue-600 text-white p-3 rounded-md font-bold text-lg"
          >
            プロフィールを保存する
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}