import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { addItem, getCategories, lookupBarcode } from '../api'
import BarcodeScanner from '../components/BarcodeScanner'

const UNITS = ['g', 'kg', 'pièce', 'litre', 'cl', 'portion']
const FAVORITES_KEY = 'congelo_favorites'

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') } catch { return [] }
}

function saveFavorite(item) {
  const favs = getFavorites().filter(f => f.name !== item.name)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([item, ...favs].slice(0, 8)))
}

export default function AddItem() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [favorites, setFavorites] = useState(getFavorites())
  const [showScanner, setShowScanner] = useState(false)
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

  function applyFavorite(fav) {
    setForm(f => ({
      ...f,
      name: fav.name,
      unit: fav.unit,
      category_id: fav.category_id || '',
      quantity: '',
    }))
  }

  async function handleBarcodeDetected(code) {
    set('barcode', code)
    setScanning(true)
    try {
      const product = await lookupBarcode(code)
      if (product.name) set('name', product.name)
    } catch {}
    setScanning(false)
  }

  async function handleBarcodeInput(code) {
    if (!code || code.length < 8) return
    await handleBarcodeDetected(code)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.quantity) {
      setError('Nom et quantité sont requis.')
      return
    }
    setSubmitting(true)
    const payload = { ...form, quantity: parseFloat(form.quantity) }
    await addItem(payload)
    saveFavorite({ name: form.name, unit: form.unit, category_id: form.category_id })
    setFavorites(getFavorites())
    navigate('/')
  }

  return (
    <div className="page">
      {showScanner && (
        <BarcodeScanner
          onDetected={handleBarcodeDetected}
          onClose={() => setShowScanner(false)}
        />
      )}

      {favorites.length > 0 && (
        <section className="favorites-section">
          <p className="category-title">Ajouts rapides</p>
          <div className="favorites-list">
            {favorites.map((fav, i) => (
              <button key={i} className="fav-chip" onClick={() => applyFavorite(fav)}>
                {fav.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <h2 className="page-title">Ajouter un article</h2>
      <form className="form" onSubmit={handleSubmit}>

        <label className="form-label">
          Code-barre (optionnel)
          <div className="barcode-row">
            <input
              className="form-input"
              type="text"
              placeholder="Saisir le code..."
              value={form.barcode}
              onChange={e => set('barcode', e.target.value)}
              onBlur={e => handleBarcodeInput(e.target.value)}
            />
            <button type="button" className="btn-scan" onClick={() => setShowScanner(true)}>
              📷
            </button>
          </div>
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
