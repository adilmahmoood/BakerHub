'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function CustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    const checkAccessAndLoad = async () => {
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

      if (userRow?.role !== 'customer') {
        router.push('/login')
        return
      }

      // ✅ STEP 1: Load products
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, price, baker_id')
        .order('created_at', { ascending: false })

      if (!productsData) {
        setLoading(false)
        return
      }

      // ✅ STEP 2: Get all baker IDs
      const bakerIds = productsData.map((p) => p.baker_id)

      // ✅ STEP 3: Fetch baker profiles
      const { data: bakers } = await supabase
        .from('baker_profiles')
        .select('user_id, name, location')
        .in('user_id', bakerIds)

      // ✅ STEP 4: Merge products + baker info
      const merged = productsData.map((product) => {
        const baker = bakers?.find(
          (b) => b.user_id === product.baker_id
        )

        return {
          ...product,
          baker_name: baker?.name,
          baker_city: baker?.location,
        }
      })

      setProducts(merged)
      setLoading(false)
    }

    checkAccessAndLoad()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p>Loading products...</p>

  return (
    <div>
      <h1>Available Cakes</h1>

      {products.length === 0 && <p>No products yet</p>}

      {products.map((p) => (
        <div
          key={p.id}
          style={{
            border: '1px solid #ccc',
            margin: 10,
            padding: 10,
          }}
        >
          <h3>{p.name}</h3>
          <p>₹{p.price}</p>

          <p>Bakery: {p.baker_name || 'Unknown'}</p>
          <p>City: {p.baker_city || 'N/A'}</p>
        </div>
      ))}

      <br />
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
