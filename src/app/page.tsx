// src/app/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

// 取得するプロジェクトの型定義
type Project = {
  id: string
  title: string
  description: string
  required_skills: string[]
  created_at: string
  profiles: {
    display_name: string | null
    school: string | null
  } | null
}

export default async function Home() {
  const supabase = await createClient()

  // 1. ユーザーの認証確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // 2. プロジェクト一覧の取得 (profilesテーブルと結合して作成者情報も取得)
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      description,
      required_skills,
      created_at,
      profiles (
        display_name,
        school
      )
    `)
    .order('created_at', { ascending: false })

  // 取得したデータを Project 型の配列としてキャスト（型を強制）する
  const projects = data as Project[] | null

  if (error) {
    console.error('プロジェクトの取得に失敗しました:', error)
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* ヘッダー部分 */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-blue-600">Port</h1>
        <div className="text-sm text-gray-600 flex items-center gap-4">
          <span>ログイン中: {user.email}</span>
          {/* 今後実装するログアウトボタンのプレースホルダー */}
          <button className="text-red-500 hover:underline">ログアウト</button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">募集中のプロジェクト</h2>
          {/* 今後実装する新規作成ボタン */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-semibold shadow-sm">
            新規プロジェクトを作成
          </button>
        </div>

        {/* プロジェクト一覧のカード表示 */}
        <div className="grid gap-6">
          {projects && projects.length > 0 ? (
           projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                
                <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  <span className="font-semibold text-gray-700">
                    {project.profiles?.display_name || '名無し'}
                  </span>
                  {project.profiles?.school && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                      {project.profiles.school}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-6 whitespace-pre-wrap leading-relaxed">
                  {project.description}
                </p>
                
                {/* 求めるスキルのタグ表示 */}
                <div className="flex gap-2 flex-wrap">
                  {project.required_skills && project.required_skills.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 mb-4">現在募集中のプロジェクトはありません。</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}