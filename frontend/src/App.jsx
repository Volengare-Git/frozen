import { Routes, Route, NavLink } from 'react-router-dom'
import Inventory from './pages/Inventory'
import AddItem from './pages/AddItem'
import RemoveItem from './pages/RemoveItem'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Congelo</h1>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Inventory />} />
          <Route path="/ajouter" element={<AddItem />} />
          <Route path="/retirer" element={<RemoveItem />} />
        </Routes>
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
      </nav>
    </div>
  )
}
