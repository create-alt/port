// src/app/projects/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { applyToProject, cancelApplication } from './actions'

// ▼ フォーム設問の型
type FormQuestion = {
  id: string
  type: 'text' | 'radio' | 'checkbox'
  label: string
  options?: string
}

// ▼ 申し込みデータの型（これを追加）
type Application = {
  id: string
  applicant_id: string
  answers: Record<string, string | string[]>
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*, profiles(*), applications(*)')
    .eq('id', id)
    .single()

  if (!project) return <div className="p-8 text-center">プロジェクトが見つかりません</div>

  const schema: FormQuestion[] = project.form_schema || []
  
  // ▼ any を Application に変更
  const myApplication = project.applications?.find((app: Application) => app.applicant_id === user.id)

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link href="/" className="text-blue-500 hover:underline text-sm mb-6 block">← トップページへ戻る</Link>
      
      {/* ▼ プロジェクト詳細の表示エリア ▼ */}
      <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm mb-8">
        <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
        
        <div className="flex items-center gap-4 mb-6 pb-6 border-b">
          {project.profiles?.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={project.profiles.avatar_url} alt="avatar" className="w-12 h-12 rounded-full object-cover border" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 border flex items-center justify-center text-[10px] text-gray-500 font-bold">
              NoImage
            </div>
          )}
          <div>
            <p className="font-bold text-gray-800">{project.profiles?.display_name || '名無し'}</p>
            <p className="text-sm text-gray-500">{project.profiles?.school || '所属未設定'}</p>
          </div>
          <div className="ml-auto text-right">
            <span className="text-xs font-bold text-gray-400 block">連絡先</span>
            <p className="text-blue-600 text-sm font-semibold">{project.contact_info || '未記載'}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-2">プロジェクト詳細</h3>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{project.description}</p>
        </div>

        <div>
          <h3 className="font-bold text-gray-700 mb-2">求めるスキル</h3>
          <div className="flex gap-2 flex-wrap">
            {project.required_skills?.map((skill: string, index: number) => (
              <span key={index} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full border border-gray-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ▼ 申し込み・回答編集エリア ▼ */}
      {myApplication ? (
        <div className="bg-blue-50 border border-blue-200 p-8 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-blue-800">申し込み済みです</h2>
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">応募完了</span>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-blue-100 mb-6 space-y-4">
            <h3 className="font-bold text-gray-700 border-b pb-2 mb-4">あなたの回答内容</h3>
            {schema.map((q) => (
              <div key={q.id}>
                <p className="text-sm font-bold text-gray-500 mb-1">{q.label}</p>
                <p className="text-gray-900 font-medium">
                  {Array.isArray(myApplication.answers[q.id]) 
                    ? (myApplication.answers[q.id] as string[]).join(' / ') 
                    : (myApplication.answers[q.id] as string || '未回答')}
                </p>
              </div>
            ))}
          </div>
          
          <form action={cancelApplication}>
            <input type="hidden" name="applicationId" value={myApplication.id} />
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit" className="w-full bg-red-100 text-red-600 p-4 rounded-xl font-bold hover:bg-red-200 transition border border-red-200">
              申し込みを取り消す
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">このプロジェクトに申し込む</h2>
          <form action={applyToProject} className="flex flex-col gap-6">
            <input type="hidden" name="projectId" value={project.id} />
            
            {schema.map((q) => {
              const options = q.options ? q.options.split(',').map((o: string) => o.trim()) : []
              return (
                <div key={q.id} className="bg-gray-50 p-6 border rounded-lg">
                  <label className="block font-bold mb-3">{q.label}</label>
                  {q.type === 'text' && (
                    <textarea name={q.id} required rows={3} className="w-full border p-3 rounded-md resize-none" />
                  )}
                  {q.type === 'radio' && options.map((opt: string, idx: number) => (
                    <label key={idx} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="radio" name={q.id} value={opt} required className="w-4 h-4 text-blue-600" />
                      <span>{opt}</span>
                    </label>
                  ))}
                  {q.type === 'checkbox' && options.map((opt: string, idx: number) => (
                    <label key={idx} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="checkbox" name={q.id} value={opt} className="w-4 h-4 rounded text-blue-600" />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )
            })}
            
            {schema.length === 0 && <p className="text-gray-500">特別な設問はありません。そのまま申し込めます。</p>}
            
            <button type="submit" className="w-full bg-green-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-green-700 transition mt-2 shadow-md">
              申し込みを確定する
            </button>
          </form>
        </div>
      )}
    </div>
  )
}