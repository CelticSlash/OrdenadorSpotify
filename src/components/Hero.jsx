import { useState } from "react"
import { Link, ArrowRight } from "lucide-react"

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

        <h1>
          Suas músicas.
          <br/>
          Do seu jeito.
        </h1>

        <p>
          Organize sua playlist do Spotify de forma rápida e simples.
        </p>
      </div>

      <div className="hero-playlist-input">
        <span className="hero-input-label">
          COLE O LINK DA SUA PLAYLIST
        </span>

        <form className="playlist-url-form" onSubmit={handleSubmit}>
          <div className="playlist-url-input">
            <Link size={18} />

            <input type="text" placeholder="https://open.spotify.com/playlist/..." value={playlistUrl}
              onChange={(event) =>
                setPlaylistUrl(event.target.value)
              }
            />
          </div>

          <button type="submit" disabled={!playlistUrl.trim() || loading} className="load-playlist-button">
            {loading ? "Carregando..." : "Carregar playlist"}
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </section>
  )
}

export default Hero