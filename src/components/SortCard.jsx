function SortCard({
  onSortByName,
  onApplyOrder,
  applyingOrder,
}) {
  return (
    <section className="sort-card">
      <div className="sort-header">
        <span className="sort-label">
          ORGANIZAÇÃO
        </span>

        <h2>
          Como você quer organizar?
        </h2>

        <p>
          Escolha o tipo de ordenação para sua
          playlist.
        </p>
      </div>

      <div className="sort-options">
        <button
          className="sort-option active"
          onClick={onSortByName}
        >
          <span className="sort-option-icon">
            A→Z
          </span>

          <span className="sort-option-info">
            <strong>
              Nome A → Z
            </strong>

            <small>
              Ordem alfabética
            </small>
          </span>

          <span className="sort-option-arrow">
            →
          </span>
        </button>
      </div>

      <button
        className="organize-button"
        onClick={onApplyOrder}
        disabled={applyingOrder}
      >
        <span>
          {applyingOrder
            ? "Atualizando Spotify..."
            : "Aplicar no Spotify"}
        </span>

        <span>→</span>
      </button>
    </section>
  )
}

export default SortCard