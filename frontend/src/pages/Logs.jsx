import { useState, useEffect } from 'react'
import { getLogs } from '../api'

const ACTION_LABEL = { ajout: '➕ Ajout', retrait: '➖ Retrait' }
const ACTION_CLASS = { ajout: 'log-add', retrait: 'log-remove' }

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLogs().then(data => { setLogs(data); setLoading(false) })
  }, [])

  if (loading) return <p className="loading">Chargement...</p>

  return (
    <div className="page">
      <h2 className="page-title">Historique</h2>
      {logs.length === 0 && <p className="empty">Aucune activité pour l'instant.</p>}
      <ul className="log-list">
        {logs.map(log => (
          <li key={log.id} className="log-item">
            <div className="log-left">
              <span className={`log-action ${ACTION_CLASS[log.action]}`}>
                {ACTION_LABEL[log.action] || log.action}
              </span>
              <span className="item-name">{log.item_name}</span>
            </div>
            <div className="log-right">
              <span className="item-qty">{log.quantity} {log.unit}</span>
              <span className="item-date">
                {new Date(log.created_at).toLocaleString('fr-FR', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
