function PlaylistCard({ tracks = [], playlist }) {
  return (
    <section className="playlist-card">
      <div className="playlist-top">

        <div className="playlist-cover">
          {playlist?.image ? (
            <img src={playlist.image} alt={playlist.name} />
          ) : (
            <span>♫</span>
          )}
        </div>

        <div className="playlist-info">
          <span className="playlist-label">
            PLAYLIST
          </span>

          <h2>
            {playlist?.name || "Minha Playlist"}
          </h2>

          <p>
            {tracks.length} músicas
          </p>
        </div>

      </div>

      <div className="playlist-divider" />

      <div className="track-list">
        {tracks.length === 0 ? (
          <div className="empty-playlist">
            <span>Nenhuma música carregada.</span>
          </div>
        ) : (
          tracks.map((track, index) => (
            <div className="track-item" key={track.uri}>
              <span className="track-number">
                {String(index + 1).padStart(2, "0")}
              </span>

              {track.albumImage && (
                <img className="track-cover" src={track.albumImage} alt="" />
              )}

              <div className="track-details">
                <span className="track-name">
                  {track.name}
                </span>

                <span className="track-artist">
                  {track.artist}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default PlaylistCard