'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function BakerProfilePage() {
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from('baker_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setName(data.name || '')
        setBio(data.bio || '')
        setCity(data.city || '')
      }
    }

    loadProfile()
  }, [])

  const saveProfile = async () => {
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('baker_profiles')
      .update({ name, bio, city })
      .eq('user_id', user.id)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Profile updated!')
    }
  }

  return (
    <div>
      <h1>Baker Profile</h1>

      <input
        placeholder="Bakery Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <br />

      <textarea
        placeholder="About your bakery"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <br />

      <input
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <br />

      <button onClick={saveProfile}>Save</button>

      {message && <p>{message}</p>}
    </div>
  )
}
