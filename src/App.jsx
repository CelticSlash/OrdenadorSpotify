import { useEffect, useState } from "react"
import {
  getAccessToken,
  getValidAccessToken,
  getPlaylistTracks,
  getCurrentUserProfile,
  getPlaylist,
  extractPlaylistId,
  updatePlaylistOrder
} from "./services/spotify"
import { sortTracksByName } from "./utils/sorting"

import Header from "./components/Header"
import Hero from "./components/Hero"
import PlaylistCard from "./components/PlaylistCard"
import SortCard from "./components/SortCard"
import HowItWorks from "./components/HowItWorks"
import Footer from "./components/Footer"

function App() {
  const [user, setUser] = useState(null)
  const [playlist, setPlaylist] = useState(null)
  const [tracks, setTracks] = useState([])
  const [orderedTracks, setOrderedTracks] = useState([])
  const [loadingPlaylist, setLoadingPlaylist] = useState(false)
  const [playlistId, setPlaylistId] = useState(null)
  const [applyingOrder, setApplyingOrder] = useState(false)

  useEffect(() => {
    async function initializeSpotify() {
      try {
        const params = new URLSearchParams(
          window.location.search
        )

        const code = params.get("code")

        let accessToken

        if (code) {
          // Primeiro login: troca o código pelo token
          accessToken = await getAccessToken(code)

          // Remove ?code= da URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          )
        } else {
          // Página recarregada: tenta recuperar a sessão
          accessToken = await getValidAccessToken()
        }

        // Não existe sessão
        if (!accessToken) {
          return
        }

        // Busca o perfil do usuário
        const profile =
          await getCurrentUserProfile(accessToken)

        setUser(profile)

      } catch (error) {
        console.error(
          "Erro ao inicializar Spotify:",
          error
        )
      }
    }

    initializeSpotify()
  }, [])

  async function handleLoadPlaylist(url) {
    try {
      setLoadingPlaylist(true)

      const playlistId = extractPlaylistId(url)

      if (!playlistId) {
        alert(
          "Cole um link válido de uma playlist do Spotify."
        )
        return
      }

      const accessToken = await getValidAccessToken()

      if (!accessToken) {
        alert("Faça login com o Spotify primeiro.")
        return
      }

      const playlistData =
        await getPlaylist(
          accessToken,
          playlistId
        )

      const playlistTracks =
        await getPlaylistTracks(
          accessToken,
          playlistId
        )

      setPlaylistId(playlistId)
      setPlaylist(playlistData)
      setTracks(playlistTracks)
      setOrderedTracks(playlistTracks)

    } catch (error) {
      console.error(
        "Erro ao carregar playlist:",
        error
      )

      alert(
        "Não foi possível carregar essa playlist."
      )
    } finally {
      setLoadingPlaylist(false)
    }
  }

  async function handleApplyOrder() {
    try {
      if (
        !playlistId ||
        !playlist ||
        tracks.length === 0
      ) {
        return
      }

      const accessToken =
        await getValidAccessToken()

      if (!accessToken) {
        alert("Faça login com o Spotify primeiro.")
        return
      }

      setApplyingOrder(true)

      const newSnapshotId =
        await updatePlaylistOrder(
          accessToken,
          playlistId,
          tracks,
          orderedTracks,
          playlist.snapshotId
        )

      setPlaylist((currentPlaylist) => ({
        ...currentPlaylist,
        snapshotId: newSnapshotId,
      }))

      setTracks(orderedTracks)

      alert(
        "Playlist organizada com sucesso! 🎉"
      )

    } catch (error) {
      console.error(
        "Erro ao aplicar ordem:",
        error
      )

      alert(
        "Não foi possível atualizar a playlist."
      )
    } finally {
      setApplyingOrder(false)
    }
  }

  function handleSortByName() {
    const sorted = sortTracksByName(tracks)

    setOrderedTracks(sorted)
  }

  return (
    <main>
      <Header user={user} />
      <Hero
        onLoadPlaylist={handleLoadPlaylist}
        loading={loadingPlaylist}
      />

      <section className="content-section">
        <PlaylistCard
          tracks={orderedTracks}
          playlist={playlist}
        />
        <SortCard
          onSortByName={handleSortByName}
          onApplyOrder={handleApplyOrder}
          applyingOrder={applyingOrder}
        />
      </section>

      <HowItWorks />
      <Footer />
    </main>
  )
}

export default App