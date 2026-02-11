'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')

    const { data, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    if (authError) {
      setError(authError.message)
      return
    }

    const user = data.user
    if (!user) return

    // 🔹 Fetch role
    const { data: userRow } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userRow?.role === 'customer') {
      router.push('/customer')
      return
    }

    if (userRow?.role === 'baker') {
      const { data: bakerProfile } = await supabase
        .from('baker_profiles')
        .select('status')
        .eq('user_id', user.id)
        .single()

      if (bakerProfile?.status === 'approved') {
        router.push('/baker')
        return
      }

      setError('Your baker account is awaiting approval')
      await supabase.auth.signOut()
      return
    }

    setError('Invalid role')
    await supabase.auth.signOut()
  }

  return (
    <div>
      <h1>Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
