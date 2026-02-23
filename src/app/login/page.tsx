import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form className="flex flex-col gap-4 p-8 border rounded shadow-md w-80">
        <h1 className="text-2xl font-bold text-center">Port Login</h1>
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          required 
          className="border p-2 rounded text-black"
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          required 
          className="border p-2 rounded text-black"
        />
        <button formAction={login} className="bg-blue-500 text-white p-2 rounded">
          ログイン
        </button>
        <button formAction={signup} className="bg-green-500 text-white p-2 rounded">
          新規登録
        </button>
      </form>
    </div>
  )
}