import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addItem, getCategories, lookupBarcode } from '../api'

const UNITS = ['g', 'kg', 'pièce', 'litre', 'cl', 'portion']

export default function AddItem() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: '',
    quantity: '',
    unit: 'pièce',
    category_id: '',
    frozen_at: new Date().toISOString().split('T')[0],
    expires_at: '',
    barcode: '',
  })
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleBarcodeInput(code) {
    if (!code || code.length < 8) return
    setScanning(true)
    try {
      const product = await lookupBarcode(code)
      if (product.name) set('name', product.name)
      set('barcode', code)
    } catch {
      // produit inconnu, on garde le code
    } finally {
      setScanning(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.quantity) {
      setError('Nom et quantité sont requis.')
      return
    }
    setSubmitting(true)
    await addItem({ ...form, quantity: parseFloat(form.quantity) })
    navigate('/')
  }

  return (
    <div className="page">
      <h2 className="page-title">Ajouter un article</h2>
      <form className="form" onSubmit={handleSubmit}>

        <label className="form-label">
          Code-barre (optionnel)
          <input
            className="form-input"
            type="text"
            placeholder="Scanner ou saisir le code"
            value={form.barcode}
            onChange={e => set('barcode', e.target.value)}
            onBlur={e => handleBarcodeInput(e.target.value)}
          />
          {scanning && <span className="hint">Recherche du produit...</span>}
        </label>

        <label className="form-label">
          Nom *
          <input
            className="form-input"
            type="text"
            required
            placeholder="ex: Nuggets de poulet"
            value={form.name}
            onChange={e => set('name', e.target.value)}
          />
        </label>

        <div className="form-row">
          <label className="form-label" style={{ flex: 2 }}>
            Quantité *
            <input
              className="form-input"
              type="number"
              required
              min="0.1"
              step="any"
              placeholder="500"
              value={form.quantity}
              onChange={e => set('quantity', e.target.value)}
            />
          </label>
          <label className="form-label" style={{ flex: 1 }}>
            Unité
            <select className="form-input" value={form.unit} onChange={e => set('unit', e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </label>
        </div>

        <label className="form-label">
          Catégorie
          <select className="form-input" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
            <option value="">-- Choisir --</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <label className="form-label">
          Date de congélation
          <input
            className="form-input"
            type="date"
            value={form.frozen_at}
            onChange={e => set('frozen_at', e.target.value)}
          />
        </label>

        <label className="form-label">
          Date limite de consommation (optionnel)
          <input
            className="form-input"
            type="date"
            value={form.expires_at}
            onChange={e => set('expires_at', e.target.value)}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Ajout...' : 'Ajouter au congélateur'}
        </button>
      </form>
    </div>
  )
}
