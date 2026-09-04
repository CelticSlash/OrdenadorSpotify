import { useState } from "react"
import { Music2, ChevronDown, ChevronUp, LogOut } from "lucide-react"
import { loginWithSpotify } from "../services/spotify"

function Header({ user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    setMenuOpen(false)
    onLogout()
  }

  return (
    <header className="header">
      <div className="logo">
        <span>♫</span>
        Playlist Sorter
      </div>

      {!user ? (
        <button
          className="login-button"
          onClick={loginWithSpotify}>

          <Music2 size={18} />
          Entrar com Spotify
        </button>
      ) : (
        <div className="user-menu">
          <button
            className={`user-profile ${menuOpen ? "user-profile-open" : ""}`}
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}>
              
            {user.image ? (
              <img src={user.image} alt="" className="user-avatar" />
            ) : (
              <div className="user-avatar user-avatar-fallback">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="user-info">
              <span className="user-label">CONECTADO</span>
              <strong>{user.name}</strong>
            </div>

            {menuOpen ? (<ChevronUp size={16} />) : (<ChevronDown size={16} />)}
          </button>

          {menuOpen && (
            <div className="user-dropdown">
              <button className="logout-button" onClick={handleLogout}>                  
                <LogOut size={16} />
                Sair do Spotify
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}

export default Header