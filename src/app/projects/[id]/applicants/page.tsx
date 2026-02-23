import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ▼ 1. 型定義を追加
type FormQuestion = {
  id: string
  type: 'text' | 'radio' | 'checkbox'
  label: string
  options?: string
}

type Application = {
  id: string
  answers: Record<string, string | string[]>
  profiles: {
    display_name: string | null
    school: string | null
    avatar_url: string | null
  }
}

export default async function ApplicantsPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*, applications(*, profiles(*))')
    .eq('id', id)
    .single()

  if (!project || project.author_id !== user.id) {
    return <div>アクセス権限がありません。</div>
  }

  // ▼ 2. 型を明示
  const schema: FormQuestion[] = project.form_schema || []
  const applicants: Application[] = project.applications || []

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/" className="text-blue-500 hover:underline text-sm mb-4 block">← トップページへ</Link>
      <h1 className="text-3xl font-bold mb-2">応募者管理</h1>
      <h2 className="text-xl text-gray-600 mb-8 pb-4 border-b">プロジェクト: {project.title}</h2>

      {applicants.length === 0 ? (
        <p className="text-center py-12 text-gray-500 border rounded-xl bg-gray-50">まだ応募者はいません。</p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* ▼ 3. (app: any) の any を削除 */}
          {applicants.map((app) => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4 border-b pb-4">
                {app.profiles.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.profiles.avatar_url} alt="avatar" className="w-12 h-12 rounded-full object-cover border" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 border" />
                )}
                <div>
                  <h3 className="font-bold text-lg">{app.profiles.display_name}</h3>
                  <p className="text-sm text-gray-500">{app.profiles.school}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">フォーム回答内容</h4>
                {/* ▼ 4. (q: any) の any を削除 */}
                {schema.map((q) => (
                  <div key={q.id} className="mb-4 last:mb-0">
                    <p className="text-sm font-bold text-gray-600">{q.label}</p>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                      {Array.isArray(app.answers[q.id]) 
                        ? (app.answers[q.id] as string[]).join(' / ') 
                        : (app.answers[q.id] as string || '未回答')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}