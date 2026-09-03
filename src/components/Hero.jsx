import { useState } from "react"

function Hero({ onLoadPlaylist, loading }) {
  const [playlistUrl, setPlaylistUrl] = useState("")

  function handleSubmit(event) {
    event.preventDefault()

    if (!playlistUrl.trim()) {
      return
    }

    onLoadPlaylist(playlistUrl.trim())
  }

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-label">
          ORGANIZE SUA PLAYLIST
        </span>

        <h1>
          Suas músicas.
          <br />
          <span>Do seu jeito.</span>
        </h1>

        <p>
          Organize sua playlist do Spotify
          de forma rápida e simples.
        </p>
      </div>

      <div className="hero-playlist-input">
        <span className="hero-input-label">
          COLE O LINK DA SUA PLAYLIST
        </span>

        <form
          className="playlist-url-form"
          onSubmit={handleSubmit}
        >
          <div className="playlist-url-input">
            <span>↗</span>

            <input
              type="text"
              placeholder="https://open.spotify.com/playlist/..."
              value={playlistUrl}
              onChange={(event) =>
                setPlaylistUrl(event.target.value)
              }
            />
          </div>

          <button
            type="submit"
            disabled={!playlistUrl.trim() || loading}
            className="load-playlist-button"
          >
            {loading
              ? "Carregando..."
              : "Carregar playlist"}

            <span>→</span>
          </button>
        </form>
      </div>
    </section>
  )
}

export default Hero