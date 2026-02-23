export const dynamic = 'force-dynamic'
// src/app/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deleteProject } from './actions'
import { SubmitButton } from './login/submit-button'

type Project = {
  id: string
  author_id: string // ← 追加
  title: string
  description: string
  required_skills: string[]
  contact_info: string | null // ← 追加
  created_at: string
  profiles: {
    display_name: string | null
    school: string | null
    avatar_url: string | null // ←これを追加
  } | null
}

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  // author_id と contact_info を取得に追加
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id,
      author_id,
      title,
      description,
      required_skills,
      contact_info,
      created_at,
      profiles (
        display_name,
        school,
        avatar_url   // ←これを追加
      )
    `)
    .order('created_at', { ascending: false })
  if (error) {
    console.error('【データ取得エラー】:', error)
  }
  console.log('【取得したデータ】:', data)
  const projects = data as Project[] | null

  return (
    <div className="max-w-4xl mx-auto p-8">
      <header className="flex justify-between items-center mb-8 pb-4 border-b">
        <h1 className="text-3xl font-bold text-blue-600">Port</h1>
        <div className="text-sm text-gray-600 flex items-center gap-4">
          <span>{user.email}</span>
          <Link href="/profile" className="text-blue-600 hover:underline font-semibold border border-blue-600 px-3 py-1 rounded-md">
            プロフィール編集
          </Link>
        </div>
      </header>

      <main>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">募集中のプロジェクト</h2>
          <Link href="/projects/new" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-semibold">
            新規プロジェクトを作成
          </Link>
        </div>

        <div className="grid gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-xl p-6 shadow-sm bg-white hover:shadow-md transition relative">
                
                {/* 自分の投稿なら削除ボタンを表示（ご要望2の対応） */}
                {user.id === project.author_id && (
                  <form action={deleteProject} className="absolute top-6 right-6">
                    <input type="hidden" name="projectId" value={project.id} />
                    <SubmitButton 
                      className="text-red-500 text-sm hover:underline"
                      pendingText="削除中..."
                    >
                      削除する
                    </SubmitButton>
                  </form>
                )}

                <h3 className="text-xl font-bold mb-2 pr-20">{project.title}</h3>
                
                <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                  {project.profiles?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.profiles.avatar_url} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                  )}
                  <span className="font-semibold text-gray-700">{project.profiles?.display_name || '名無し'}</span>
                  {project.profiles?.school && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">{project.profiles.school}</span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-6 whitespace-pre-wrap leading-relaxed">{project.description}</p>
                
                <div className="flex gap-2 flex-wrap mb-4">
                  {project.required_skills && project.required_skills.map((skill, index) => (
                    <span key={index} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* 連絡手段の表示 */}
                {project.contact_info && (
                  <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-900 border border-blue-100">
                    <span className="font-semibold">連絡先:</span> {project.contact_info}
                  </div>
                )}
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                  {user.id === project.author_id ? (
                    <Link 
                      href={`/projects/${project.id}/applicants`}
                      className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition text-sm font-semibold"
                    >
                      応募者を管理する
                    </Link>
                  ) : (
                    <Link 
                      href={`/projects/${project.id}/apply`}
                      className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition font-bold"
                    >
                      申し込む
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-12 text-gray-500 border rounded-xl bg-gray-50">現在募集中のプロジェクトはありません。</p>
          )}
        </div>
      </main>
    </div>
  )
}