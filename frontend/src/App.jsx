import { lazy, Suspense } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'

const Inventory = lazy(() => import('./pages/Inventory'))
const AddItem = lazy(() => import('./pages/AddItem'))
const RemoveItem = lazy(() => import('./pages/RemoveItem'))
const Logs = lazy(() => import('./pages/Logs'))

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Congelo</h1>
      </header>

      <main className="app-main">
        <Suspense fallback={<p className="loading">Chargement...</p>}>
          <Routes>
            <Route path="/" element={<Inventory />} />
            <Route path="/ajouter" element={<AddItem />} />
            <Route path="/retirer" element={<RemoveItem />} />
            <Route path="/historique" element={<Logs />} />
          </Routes>
        </Suspense>
      </main>

      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">📦</span>
          <span>Inventaire</span>
        </NavLink>
        <NavLink to="/ajouter" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">➕</span>
          <span>Ajouter</span>
        </NavLink>
        <NavLink to="/retirer" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">➖</span>
          <span>Retirer</span>
        </NavLink>
        <NavLink to="/historique" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">📋</span>
          <span>Historique</span>
        </NavLink>
      </nav>
    </div>
  )
}
