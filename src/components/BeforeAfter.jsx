function BeforeAfter() {
  return (
    <section className="before-after">
      <div className="section-heading">
        <p className="eyebrow">O RESULTADO</p>

        <h2>Veja a diferença.</h2>

        <p>
          Sua playlist organizada de forma simples e automática.
        </p>
      </div>

      <div className="comparison">
        <div className="comparison-card">
          <span className="comparison-label">ANTES</span>

          <div className="comparison-songs">
            <div className="comparison-song">
              <span>01</span>
              <p>Starboy</p>
            </div>

            <div className="comparison-song">
              <span>02</span>
              <p>After Hours</p>
            </div>

            <div className="comparison-song">
              <span>03</span>
              <p>Blinding Lights</p>
            </div>

            <div className="comparison-song">
              <span>04</span>
              <p>Save Your Tears</p>
            </div>
          </div>
        </div>

        <div className="comparison-arrow">
          →
        </div>

        <div className="comparison-card after">
          <span className="comparison-label">DEPOIS</span>

          <div className="comparison-songs">
            <div className="comparison-song">
              <span>01</span>
              <p>After Hours</p>
            </div>

            <div className="comparison-song">
              <span>02</span>
              <p>Blinding Lights</p>
            </div>

            <div className="comparison-song">
              <span>03</span>
              <p>Save Your Tears</p>
            </div>

            <div className="comparison-song">
              <span>04</span>
              <p>Starboy</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BeforeAfter