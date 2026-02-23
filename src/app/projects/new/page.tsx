// src/app/projects/new/page.tsx
import Link from 'next/link'
import { createProject } from './actions'
import { SubmitButton } from '@/app/login/submit-button'

export default function NewProjectPage() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline text-sm">
          ← トップページに戻る
        </Link>
        <h1 className="text-3xl font-bold mt-4">新規プロジェクトの募集</h1>
        <p className="text-gray-600 mt-2">
          一緒に開発する仲間や、コンテストに出場するメンバーを集めましょう！
        </p>
      </div>

      <form action={createProject} className="flex flex-col gap-6 bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
        
        {/* プロジェクト名 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-semibold text-gray-700">プロジェクト名・募集タイトル</label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder="例: 熊出没検知システム「Bearrier」のUI開発メンバー募集"
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 求めるスキル */}
        <div className="flex flex-col gap-2">
          <label htmlFor="skills" className="font-semibold text-gray-700">求める技術・スキル（カンマ区切り）</label>
          <input
            id="skills"
            name="skills"
            type="text"
            placeholder="例: React, TypeScript, Next.js, Python"
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-500">複数ある場合は「,（カンマ）」で区切って入力してください。</span>
        </div>

        {/* 詳細な説明 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="description" className="font-semibold text-gray-700">プロジェクトの詳細・募集背景</label>
          <textarea
            id="description"
            name="description"
            required
            rows={6}
            placeholder="例: Raspberry Piとカメラを使って熊を検知し、撃退するシステムを作っています。一緒にWebアプリ側のフロントエンドを開発してくれる人を探しています！"
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* 送信ボタン */}
        <div className="mt-4">
          <SubmitButton 
            pendingText="募集を投稿中..."
            className="w-full bg-blue-600 text-white p-3 rounded-md font-bold text-lg"
          >
            募集を公開する
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}