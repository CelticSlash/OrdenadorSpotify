import { loginWithSpotify } from "../services/spotify"

function Header({ user }) {
  return (
    <header className="header">
      <div className="logo">
        <span>♫</span>
        Playlist Sorter
      </div>

      {!user ? (
        <button
          className="login-button"
          onClick={loginWithSpotify}
        >
          <span className="spotify-icon">●</span>
          Entrar com Spotify
        </button>
      ) : (
        <div className="user-profile">
          {user.image ? (
            <img
              src={user.image}
              alt=""
              className="user-avatar"
            />
          ) : (
            <div className="user-avatar user-avatar-fallback">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="user-info">
            <span className="user-label">CONECTADO</span>
            <strong>{user.name}</strong>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header