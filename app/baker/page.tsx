'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function BakerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: userRow } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userRow?.role !== 'baker') {
        router.push('/login')
        return
      }

      const { data: bakerProfile } = await supabase
        .from('baker_profiles')
        .select('status')
        .eq('user_id', user.id)
        .single()

      if (bakerProfile?.status !== 'approved') {
        router.push('/login')
        return
      }

      setLoading(false)
    }

    checkAccess()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p>Checking baker access...</p>

  return (
  <div>
    <h1>Baker Dashboard</h1>

    <button onClick={() => router.push('/baker/products')}>
      Manage Products
    </button>

    <br /><br />

    <button onClick={() => router.push('/baker/profile')}>
      Edit Profile
    </button>

    <br /><br />

    <button onClick={handleLogout}>Logout</button>
  </div>
)


}
