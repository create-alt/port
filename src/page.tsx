import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // ログインしていない場合はログイン画面へリダイレクト
  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">ようこそ、Portへ！</h1>
      <p>現在ログインしているユーザー: {user.email}</p>
      <p>ここに学生同士のマッチング機能を作っていきましょう。</p>
    </div>
  )
}