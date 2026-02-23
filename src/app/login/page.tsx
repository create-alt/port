// src/app/login/page.tsx
import Link from 'next/link'
import { login, signup } from './actions'
import { SubmitButton } from './submit-button'

// Next.js 15の仕様に合わせた searchParams の型定義
export default async function LoginPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ message?: string; error?: string }> 
}) {
  // Promiseを展開してパラメータを取得
  const { message, error } = await searchParams

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto mt-20">
      <Link href="/" className="text-blue-500 hover:underline text-sm mb-4">
        ← トップページに戻る
      </Link>

      <form className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        
        {/* ▼ エラー時の赤いメッセージ ▼ */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 text-sm border border-red-200">
            ログインまたは登録に失敗しました。入力内容をご確認ください。
          </div>
        )}

        {/* ▼ メール確認などの緑のメッセージ（ここを追加！） ▼ */}
        {message && (
          <div className="bg-green-50 text-green-700 p-4 rounded-md mb-4 text-sm font-bold border border-green-200 leading-relaxed">
            {message}
          </div>
        )}

        <label className="text-md" htmlFor="email">
          メールアドレス
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />
        
        <label className="text-md" htmlFor="password">
          パスワード
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />

        <SubmitButton
          formAction={login}
          className="bg-blue-600 rounded-md px-4 py-2 text-white mb-2 font-bold"
          pendingText="ログイン中..."
        >
          ログイン
        </SubmitButton>
        
        <SubmitButton
          formAction={signup}
          className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2"
          pendingText="登録中..."
        >
          新規登録
        </SubmitButton>
      </form>
    </div>
  )
}