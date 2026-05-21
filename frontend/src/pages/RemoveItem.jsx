import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getItems, updateItem, deleteItem } from '../api'

export default function RemoveItem() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getItems().then(setItems)
  }, [])

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleRemove(e) {
    e.preventDefault()
    if (!selected) return
    setSubmitting(true)
    const amount = parseFloat(qty)
    if (amount >= selected.quantity) {
      await deleteItem(selected.id)
    } else {
      await updateItem(selected.id, { quantity: selected.quantity - amount })
    }
    navigate('/')
  }

  return (
    <div className="page">
      <h2 className="page-title">Retirer un article</h2>

      <input
        className="search-input"
        type="search"
        placeholder="Rechercher..."
        value={search}
        onChange={e => { setSearch(e.target.value); setSelected(null) }}
      />

      {!selected && (
        <ul className="item-list">
          {filtered.map(item => (
            <li
              key={item.id}
              className="item-card selectable"
              onClick={() => { setSelected(item); setQty(String(item.quantity)) }}
            >
              <span className="item-name">{item.name}</span>
              <span className="item-qty">{item.quantity} {item.unit}</span>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <form className="form" onSubmit={handleRemove}>
          <div className="selected-item">
            <strong>{selected.name}</strong>
            <span>Stock actuel : {selected.quantity} {selected.unit}</span>
          </div>

          <label className="form-label">
            Quantité retirée
            <input
              className="form-input"
              type="number"
              min="0.1"
              step="any"
              max={selected.quantity}
              value={qty}
              onChange={e => setQty(e.target.value)}
              autoFocus
            />
          </label>

          <div className="form-row">
            <button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '...' : 'Confirmer'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
