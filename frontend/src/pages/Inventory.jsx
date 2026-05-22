import { useState, useEffect } from 'react'
import { getItems } from '../api'
import { lazy, Suspense } from 'react'

const EditModal = lazy(() => import('../components/EditModal'))

const EXPIRY_DAYS_WARN = 7

function expiryStatus(expiresAt) {
  if (!expiresAt) return null
  const diff = Math.ceil((new Date(expiresAt) - new Date()) / 86400000)
  if (diff < 0) return 'expired'
  if (diff <= EXPIRY_DAYS_WARN) return 'soon'
  return 'ok'
}

function ExpiryBadge({ expiresAt }) {
  const status = expiryStatus(expiresAt)
  if (!status || status === 'ok') return null
  const diff = Math.ceil((new Date(expiresAt) - new Date()) / 86400000)
  return (
    <span className={`badge badge-${status}`}>
      {status === 'expired' ? 'Expiré' : `${diff}j`}
    </span>
  )
}

export default function Inventory() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)

  function load() {
    getItems().then(data => { setItems(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase())
  )

  const grouped = filtered.reduce((acc, item) => {
    const cat = item.category_name || 'Autre'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  if (loading) return <p className="loading">Chargement...</p>

  return (
    <div className="page">
      {editingItem && (
        <Suspense fallback={null}>
          <EditModal
            item={editingItem}
            onClose={() => setEditingItem(null)}
            onSaved={() => { setEditingItem(null); load() }}
          />
        </Suspense>
      )}

      <input
        className="search-input"
        type="search"
        placeholder="Rechercher..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {Object.keys(grouped).length === 0 && (
        <p className="empty">Aucun article. Commencez par en ajouter !</p>
      )}

      {Object.entries(grouped).map(([category, categoryItems]) => (
        <section key={category} className="category-section">
          <h2 className="category-title">{category}</h2>
          <ul className="item-list">
            {categoryItems.map(item => (
              <li key={item.id} className="item-card">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  {item.frozen_at && (
                    <span className="item-date">Congelé le {new Date(item.frozen_at).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
                <div className="item-right">
                  <ExpiryBadge expiresAt={item.expires_at} />
                  <span className="item-qty">{item.quantity} {item.unit}</span>
                  <button className="btn-edit" onClick={() => setEditingItem(item)}>✏️</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
