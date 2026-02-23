export const dynamic = 'force-dynamic'
// src/app/projects/[id]/page.tsx の全文

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
// ▼ updateApplication を追加
import { applyToProject, cancelApplication, updateApplication } from './actions'

type FormQuestion = {
  id: string
  type: 'text' | 'radio' | 'checkbox'
  label: string
  options?: string
}

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

  // 設問が文字列になっている場合のバリア処理
  let schema: FormQuestion[] = []
  if (Array.isArray(project.form_schema)) {
    schema = project.form_schema
  } else if (typeof project.form_schema === 'string') {
    try { schema = JSON.parse(project.form_schema) } catch (e) {}
  }
  
  // 自分が既に申し込んでいるかチェック
  const myApplication = project.applications?.find((app: Application) => app.applicant_id === user.id)

  return (
    <div className="max-w-3xl mx-auto p-8">
      <Link href="/" className="text-blue-500 hover:underline text-sm mb-6 block">← トップページへ戻る</Link>
      
      {/* プロジェクト詳細の表示エリア (変更なし) */}
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

      {/* ▼ 申し込み・編集エリア ▼ */}
      {myApplication ? (
        <div className="bg-blue-50 border border-blue-200 p-8 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-blue-800">申し込み内容の確認・編集</h2>
            <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">応募済み</span>
          </div>
          
          {/* ▼ 更新フォーム ▼ */}
          <form action={updateApplication} className="flex flex-col gap-6 mb-8">
            <input type="hidden" name="applicationId" value={myApplication.id} />
            <input type="hidden" name="projectId" value={project.id} />
            
            {schema.map((q) => {
              const options = q.options ? q.options.split(',').map((o: string) => o.trim()) : []
              const currentAnswer = myApplication.answers[q.id] // 過去の回答を取得

              return (
                <div key={q.id} className="bg-white p-6 border border-blue-100 rounded-lg">
                  <label className="block font-bold text-gray-700 mb-3">{q.label}</label>
                  
                  {q.type === 'text' && (
                    <textarea name={q.id} required rows={3} defaultValue={currentAnswer as string || ''} className="w-full border p-3 rounded-md resize-none" />
                  )}
                  
                  {q.type === 'radio' && options.map((opt: string, idx: number) => (
                    <label key={idx} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input type="radio" name={q.id} value={opt} required defaultChecked={currentAnswer === opt} className="w-4 h-4 text-blue-600" />
                      <span>{opt}</span>
                    </label>
                  ))}
                  
                  {q.type === 'checkbox' && options.map((opt: string, idx: number) => {
                    const isChecked = Array.isArray(currentAnswer) ? currentAnswer.includes(opt) : currentAnswer === opt
                    return (
                      <label key={idx} className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input type="checkbox" name={q.id} value={opt} defaultChecked={isChecked} className="w-4 h-4 rounded text-blue-600" />
                        <span>{opt}</span>
                      </label>
                    )
                  })}
                </div>
              )
            })}
            
            <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition mt-2 shadow-md">
              回答内容を更新する
            </button>
          </form>

          {/* ▼ 削除ボタン ▼ */}
          <form action={cancelApplication} className="border-t border-blue-200 pt-6">
            <input type="hidden" name="applicationId" value={myApplication.id} />
            <input type="hidden" name="projectId" value={project.id} />
            <button type="submit" className="w-full bg-white text-red-500 border border-red-200 p-4 rounded-xl font-bold hover:bg-red-50 transition">
              申し込みを完全に取り消す
            </button>
          </form>
        </div>
      ) : (
        /* 未申し込みの場合のフォーム (変更なし) */
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