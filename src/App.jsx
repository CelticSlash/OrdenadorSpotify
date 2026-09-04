import { useEffect, useState } from "react"
import { getAccessToken, getValidAccessToken, getPlaylistTracks, getCurrentUserProfile, getPlaylist, extractPlaylistId, updatePlaylistOrder } from "./services/spotify"
import { sortTracksByName } from "./utils/sorting"

import Header from "./components/Header"
import Hero from "./components/Hero"
import PlaylistCard from "./components/PlaylistCard"
import SortCard from "./components/SortCard"
import HowItWorks from "./components/HowItWorks"
import Footer from "./components/Footer"
import Toast from "./components/Toast"

function App() {
  const [user, setUser] = useState(null)
  const [playlist, setPlaylist] = useState(null)
  const [tracks, setTracks] = useState([])
  const [orderedTracks, setOrderedTracks] = useState([])
  const [loadingPlaylist, setLoadingPlaylist] = useState(false)
  const [playlistId, setPlaylistId] = useState(null)
  const [applyingOrder, setApplyingOrder] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    async function initializeSpotify() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        let accessToken;

        if (code) {
          // Primeiro login: troca o código pelo token
          accessToken = await getAccessToken(code);
          // Remove ?code= da URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } 
        else {
          // Página recarregada: tenta recuperar a sessão
          accessToken = await getValidAccessToken();
        }

        // Não existe sessão
        if (!accessToken) {
          return
        }

        // Busca o perfil do usuário
        const profile = await getCurrentUserProfile(accessToken);
        setUser(profile);

      } 
      catch (error) {
        console.error("Erro ao inicializar Spotify:", error);
      }
    }

    initializeSpotify();
  }, []);

  async function handleLoadPlaylist(url) {
    try {
      setLoadingPlaylist(true);

      const playlistId = extractPlaylistId(url);

      if (!playlistId) {
        showToast("error", "Link inválido", "Cole o link de uma playlist válida do Spotify.");
        return;
      }

      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        showToast("error", "Spotify não conectado", "Entre com sua conta do Spotify para continuar.");
        return;
      }

      const playlistData = await getPlaylist(accessToken, playlistId);
      const playlistTracks = await getPlaylistTracks(accessToken, playlistId);

      setPlaylistId(playlistId);
      setPlaylist(playlistData);
      setTracks(playlistTracks);
      setOrderedTracks(playlistTracks);

    } 
    catch (error) {
      console.error("Erro ao carregar playlist:", error);

      showToast("error", "Não foi possível carregar", "Verifique o link da playlist e tente novamente.");
    } 
    finally {
      setLoadingPlaylist(false);
    }
  }

  async function handleApplyOrder() {
    if (!hasOrderChanged()) {
      return
    }

    try {
      if (!playlistId || !playlist || tracks.length === 0) {
        return
      }

      const accessToken = await getValidAccessToken();

      if (!accessToken) {
        showToast("error", "Spotify não conectado", "Entre com sua conta do Spotify para continuar.");
        return;
      }

      setApplyingOrder(true);

      const newSnapshotId = await updatePlaylistOrder(accessToken, playlistId, tracks, orderedTracks, playlist.snapshotId);

      setPlaylist((currentPlaylist) => ({
        ...currentPlaylist,
        snapshotId: newSnapshotId,
      }));

      setTracks(orderedTracks);

      showToast("success", "Playlist organizada!", "A nova ordem já foi aplicada no Spotify.");

    } 
    catch (error) {
      console.error("Erro ao aplicar ordem:", error);

      showToast("error", "Não foi possível atualizar", "O Spotify não conseguiu alterar a playlist. Tente novamente.");
    } 
    finally {
      setApplyingOrder(false);
    }
  }

  function handleSortByName() {
    const sorted = sortTracksByName(tracks);
    setOrderedTracks(sorted);
  }

  function showToast(type, title, message) {
    setToast({type, title, message,});

    setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  function hasOrderChanged() {
    if (tracks.length !== orderedTracks.length) {
      return true;
    }

    return tracks.some((track, index) => track.uri !== orderedTracks[index]?.uri);
  }

  function handleLogout() {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_refresh_token");
    localStorage.removeItem("spotify_token_expires_at");
    localStorage.removeItem("spotify_code_verifier");

    setUser(null);
    setPlaylist(null);
    setPlaylistId(null);
    setTracks([]);
    setOrderedTracks([]);
  }

  return (
    <main>
      <Header
        user={user}
        onLogout={handleLogout}
      />
      <Hero
        onLoadPlaylist={handleLoadPlaylist}
        loading={loadingPlaylist}
      />

      <HowItWorks />

      <section className="content-section">
        <PlaylistCard
          tracks={orderedTracks}
          playlist={playlist}
        />

        <SortCard
          onSortByName={handleSortByName}
          onApplyOrder={handleApplyOrder}
          applyingOrder={applyingOrder}
          hasChanges={hasOrderChanged()}
        />
      </section>
      
      <Footer />

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </main>
  )
}

export default App