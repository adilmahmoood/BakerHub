'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'customer' | 'baker'>('customer')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignup = async () => {
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error || !data.user) {
      setMessage(error?.message || 'Signup failed')
      setLoading(false)
      return
    }

    // Insert into users table
    await supabase.from('users').insert({
      id: data.user.id,
      role,
    })

    // If baker, create baker profile
    if (role === 'baker') {
      await supabase.from('baker_profiles').insert({
        user_id: data.user.id,
      })
    }

    setMessage('Signup successful 🎉')
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '40px auto' }}>
      <h2>Sign Up</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <div>
        <label>
          <input
            type="radio"
            value="customer"
            checked={role === 'customer'}
            onChange={() => setRole('customer')}
          />
          Customer
        </label>

        <label style={{ marginLeft: 10 }}>
          <input
            type="radio"
            value="baker"
            checked={role === 'baker'}
            onChange={() => setRole('baker')}
          />
          Baker
        </label>
      </div>

      <button onClick={handleSignup} disabled={loading}>
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>

      {message && <p>{message}</p>}
    </div>
  )
}
