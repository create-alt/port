import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'

// ▼ 1. 設問の型定義を追加
type FormQuestion = {
  id: string
  type: 'text' | 'radio' | 'checkbox'
  label: string
  options?: string
}

export default async function ApplyPage({ params }: { params: { id: string } }) {
  // Next.js 15ではparamsの取得にawaitが必要な場合があるため、以下のようになります
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) return <div>プロジェクトが見つかりません</div>

  async function submitApplication(formData: FormData) {
    'use server'
    const supabaseServer = await createClient()
    const { data: { user } } = await supabaseServer.auth.getUser()
    
    // ▼ 2. Recordで値の型を明示
    const answers: Record<string, string | string[]> = {}
    // ▼ 3. schemaの型を明示
    const schema: FormQuestion[] = project?.form_schema || []
    
    // ▼ 4. (q: any) の any を削除
    schema.forEach((q) => {
      if (q.type === 'checkbox') {
        // formDataから取得したものをstring配列として扱う
        answers[q.id] = formData.getAll(q.id) as string[]
      } else {
        // formDataから取得したものをstringとして扱う
        answers[q.id] = formData.get(q.id) as string
      }
    })

    const { error } = await supabaseServer
      .from('applications')
      .insert({
        project_id: project!.id,
        applicant_id: user!.id,
        answers: answers
      })

    if (error) {
      console.error(error)
      redirect(`/projects/${project!.id}/apply?error=true`)
    }
    
    revalidatePath('/')
    redirect('/?success=applied')
  }

  // ▼ 5. schemaの型を明示
  const schema: FormQuestion[] = project.form_schema || []

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link href="/" className="text-blue-500 hover:underline text-sm mb-4 block">← 戻る</Link>
      <h1 className="text-2xl font-bold mb-2">「{project.title}」への申し込み</h1>
      <p className="text-gray-600 mb-8 border-b pb-4">以下のフォームに回答して申し込んでください。</p>

      <form action={submitApplication} className="flex flex-col gap-6">
        {/* ▼ 6. (q: any) の any を削除 */}
        {schema.map((q) => {
          const options = q.options ? q.options.split(',').map((o: string) => o.trim()) : []
          
          return (
            <div key={q.id} className="bg-white p-6 border rounded-lg shadow-sm">
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

        {schema.length === 0 && (
          <p className="text-gray-500">このプロジェクトに独自の設問はありません。そのまま申し込めます。</p>
        )}

        <button type="submit" className="w-full bg-green-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-green-700 transition mt-4">
          申し込みを確定する
        </button>
      </form>
    </div>
  )
}