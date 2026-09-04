function HowItWorks() {
  return (
    <section className="how-it-works">
      <div className="section-heading">
        <p className="eyebrow">SIMPLES E RÁPIDO</p>
        <h2>Como funciona?</h2>
        <p>
          O Playlist Sorter faz a ordenação simples e rápida das suas músicas, ficando visível ao selecionar a opção de Ordem Personalizada do Spotify. 
        </p>
      </div>

      <div className="steps">
        <div className="step">
          <div className="step-number">01</div>
          <h3>Conecte o Spotify</h3>
          <p>
            Faça o login e autorize o Playlist Sorter a acessar sua playlist.
          </p>
        </div>

        <div className="step">
          <div className="step-number">02</div>
          <h3>Escolha a playlist</h3>
          <p>
            Copie o link da playlist que você quer organizar e cole no Playlist Sorter.
          </p>
        </div>

        <div className="step">
          <div className="step-number">03</div>
          <h3>Organize</h3>
          <p>
            Escolha uma das opções, veja o resultado e clique no botão para aplicar no Spotify.
          </p>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks