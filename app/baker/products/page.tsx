'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function BakerProductsPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [message, setMessage] = useState('')

  const addProduct = async () => {
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('Not logged in')
      return
    }

    const { error } = await supabase.from('products').insert({
      baker_id: user.id,
      name,
      price,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Product added!')
      setName('')
      setPrice('')
    }
  }

  return (
    <div>
      <h1>Add Product</h1>

      <input
        placeholder="Cake name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <button onClick={addProduct}>Add</button>

      {message && <p>{message}</p>}
    </div>
  )
}
