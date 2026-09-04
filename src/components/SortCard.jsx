import { useState } from "react"
import {
  ArrowRight,
  Check,
} from "lucide-react"

function SortCard({
  onSortByName,
  onApplyOrder,
  applyingOrder,
  hasChanges,
}) {
  const [selectedSort, setSelectedSort] = useState(null)

  function handleSortByName() {
    setSelectedSort("name")
    onSortByName()
  }

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
          Escolha o tipo de ordenação para sua playlist.
        </p>
      </div>

      <div className="sort-options">
        <button
          className={`sort-option ${selectedSort === "name" ? "active" : ""
            }`}
          onClick={handleSortByName}
        >
          <span className="sort-option-icon">
            A-Z
          </span>

          <span className="sort-option-info">
            <strong>
              Nome A-Z
            </strong>

            <small>
              Ordem alfabética
            </small>
          </span>

          <ArrowRight size={18} />
        </button>
      </div>

      <button
        className={`organize-button ${!hasChanges ? "organize-button-disabled" : ""}`}
        onClick={onApplyOrder}
        disabled={applyingOrder || !hasChanges }
      >
        <span>
          {applyingOrder
            ? "Atualizando Spotify..."
            : !hasChanges
              ? "Playlist já organizada"
              : "Aplicar no Spotify"}
        </span>

        <span>
          {hasChanges ? (
            <ArrowRight size={18} />
          ) : (
            <Check size={18} />
          )}
        </span>
      </button>
    </section>
  )
}

export default SortCard