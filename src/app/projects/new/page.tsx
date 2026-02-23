// src/app/projects/new/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createProject } from './actions'
import { SubmitButton } from '@/app/login/submit-button'

type Question = {
  id: string
  type: 'text' | 'radio' | 'checkbox'
  label: string
  options: string // カンマ区切りで入力させる
}

export default function NewProjectPage() {
  const [questions, setQuestions] = useState<Question[]>([])

  const addQuestion = (type: 'text' | 'radio' | 'checkbox') => {
    setQuestions([
      ...questions,
      { id: Date.now().toString(), type, label: '', options: '' }
    ])
  }

  const updateQuestion = (id: string, field: keyof Question, value: string) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-8">
        <Link href="/" className="text-blue-500 hover:underline text-sm">← トップページに戻る</Link>
        <h1 className="text-3xl font-bold mt-4">新規プロジェクトの募集</h1>
      </div>

      <form action={createProject} className="flex flex-col gap-8">
        {/* ▼ 基本情報の入力セクション ▼ */}
        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm flex flex-col gap-6">
          <h2 className="text-xl font-bold border-b pb-2">1. プロジェクトの基本情報</h2>
          {/* 既存の入力項目 */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-semibold text-gray-700">プロジェクト名</label>
            <input id="title" name="title" type="text" required className="border p-3 rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="skills" className="font-semibold text-gray-700">求める技術（カンマ区切り）</label>
            <input id="skills" name="skills" type="text" className="border p-3 rounded-md" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="font-semibold text-gray-700">詳細</label>
            <textarea id="description" name="description" required rows={4} className="border p-3 rounded-md resize-none" />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="contact_info" className="font-semibold text-gray-700">連絡手段</label>
            <input id="contact_info" name="contact_info" type="text" required className="border p-3 rounded-md" />
          </div>
        </div>

        {/* ▼ 申し込みフォーム設定セクション ▼ */}
        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-sm flex flex-col gap-6">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-bold">2. 申し込みフォームの設定</h2>
          </div>
          <p className="text-sm text-gray-600">応募者に聞きたい質問を自由に追加できます。</p>

          {/* 追加された設問のリスト */}
          {questions.map((q, index) => (
            <div key={q.id} className="p-4 border border-blue-200 bg-blue-50 rounded-md relative">
              <button type="button" onClick={() => removeQuestion(q.id)} className="absolute top-2 right-4 text-red-500 text-sm hover:underline">削除</button>
              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold text-blue-800">
                  質問 {index + 1} ({q.type === 'text' ? '自由記述' : q.type === 'radio' ? 'ラジオボタン' : 'チェックボックス'})
                </span>
                <input
                  type="text"
                  placeholder="例: Bearrier（熊撃退システム）のどの部分を担当したいですか？"
                  value={q.label}
                  onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                  className="border p-2 rounded-md"
                  required
                />
                {(q.type === 'radio' || q.type === 'checkbox') && (
                  <input
                    type="text"
                    placeholder="選択肢をカンマ区切りで入力 (例: フロントエンド(Next.js), AIモデル構築(PyTorch), ハードウェア(Raspberry Pi))"
                    value={q.options}
                    onChange={(e) => updateQuestion(q.id, 'options', e.target.value)}
                    className="border p-2 rounded-md text-sm"
                    required
                  />
                )}
              </div>
            </div>
          ))}

          {/* 設問追加ボタン */}
          <div className="flex gap-4">
            <button type="button" onClick={() => addQuestion('text')} className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 text-sm font-semibold">+ 自由記述</button>
            <button type="button" onClick={() => addQuestion('radio')} className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 text-sm font-semibold">+ ラジオボタン (1つ選択)</button>
            <button type="button" onClick={() => addQuestion('checkbox')} className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 text-sm font-semibold">+ チェックボックス (複数選択)</button>
          </div>

          {/* 状態をJSONとしてServer Actionに渡すための隠しフィールド */}
          <input type="hidden" name="form_schema" value={JSON.stringify(questions)} />
        </div>

        <SubmitButton pendingText="公開中..." className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold text-xl shadow-md hover:bg-blue-700 transition">
          この内容でプロジェクトを募集する
        </SubmitButton>
      </form>
    </div>
  )
}