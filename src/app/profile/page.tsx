// src/app/profile/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from './actions'
import { SubmitButton } from '@/app/login/submit-button'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

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
      </div>

      {/* 画像送信のために encType を追加 */}
      <form action={updateProfile} className="flex flex-col gap-6 bg-white p-8 border border-gray-200 rounded-xl shadow-sm" encType="multipart/form-data">
        
        {/* ▼ アイコン画像の設定UI ▼ */}
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">プロフィールアイコン</label>
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border">
                No Image
              </div>
            )}
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
        {/* ▲ ここまで ▲ */}

        <div className="flex flex-col gap-2">
          <label htmlFor="display_name" className="font-semibold text-gray-700">表示名</label>
          <input id="display_name" name="display_name" type="text" required defaultValue={profile?.display_name || ''} className="border p-3 rounded-md" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="school" className="font-semibold text-gray-700">所属</label>
          <input id="school" name="school" type="text" defaultValue={profile?.school || ''} className="border p-3 rounded-md" />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="skills" className="font-semibold text-gray-700">スキル（カンマ区切り）</label>
          <input id="skills" name="skills" type="text" defaultValue={profile?.skills?.join(', ') || ''} className="border p-3 rounded-md" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">連絡先 (メールアドレスやSNS IDなど)</label>
          <input
            name="contact_info"
            defaultValue={profile?.contact_info || ''}
            placeholder="連絡を取りたい際に相手に見える情報です"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="bio" className="font-semibold text-gray-700">自己紹介</label>
          <textarea id="bio" name="bio" rows={4} defaultValue={profile?.bio || ''} className="border p-3 rounded-md resize-none" />
        </div>

        <div className="mt-4">
          <SubmitButton pendingText="保存中..." className="w-full bg-blue-600 text-white p-3 rounded-md font-bold text-lg">
            プロフィールを保存する
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}