import { useState, useEffect } from 'react'
import { editItem, deleteItem, getCategories } from '../api'

const UNITS = ['g', 'kg', 'pièce', 'litre', 'cl', 'portion']

export default function EditModal({ item, onClose, onSaved }) {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: item.name,
    quantity: String(item.quantity),
    unit: item.unit,
    category_id: item.category_id || '',
    frozen_at: item.frozen_at || '',
    expires_at: item.expires_at || '',
    barcode: item.barcode || '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSubmitting(true)
    await editItem(item.id, { ...form, quantity: parseFloat(form.quantity) })
    onSaved()
  }

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    setSubmitting(true)
    await deleteItem(item.id)
    onSaved()
  }

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <div className="scanner-modal edit-modal" onClick={e => e.stopPropagation()}>
        <div className="scanner-header">
          <span>Modifier l'article</span>
          <button className="scanner-close" onClick={onClose}>✕</button>
        </div>

        <div className="edit-modal-body">
          <form className="form" onSubmit={handleSave}>
            <label className="form-label">
              Nom *
              <input className="form-input" type="text" required value={form.name}
                onChange={e => set('name', e.target.value)} />
            </label>

            <div className="form-row">
              <label className="form-label" style={{ flex: 2 }}>
                Quantité *
                <input className="form-input" type="number" required min="0.1" step="any"
                  value={form.quantity} onChange={e => set('quantity', e.target.value)} />
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
              <input className="form-input" type="date" value={form.frozen_at}
                onChange={e => set('frozen_at', e.target.value)} />
            </label>

            <label className="form-label">
              Date limite de consommation
              <input className="form-input" type="date" value={form.expires_at}
                onChange={e => set('expires_at', e.target.value)} />
            </label>

            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? '...' : 'Enregistrer'}
            </button>
          </form>

          <button
            className={`btn ${confirming ? 'btn-danger' : 'btn-secondary'}`}
            style={{ marginTop: 8, width: '100%' }}
            onClick={handleDelete}
            disabled={submitting}
          >
            {confirming ? 'Confirmer la suppression' : 'Supprimer cet article'}
          </button>
          {confirming && (
            <button className="btn btn-secondary" style={{ marginTop: 8, width: '100%' }}
              onClick={() => setConfirming(false)}>
              Annuler
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
