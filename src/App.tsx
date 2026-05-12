import { useEffect, useRef } from 'react'
import { createGame } from './game/phaserGame'

export default function App() {
  const gameRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!gameRef.current) return

    const game = createGame(gameRef.current)

    return () => {
      game.destroy(true)
    }
  }, [])

  return (
    <main className="game-layout">
      <div className="top-bar">
        <div>
          <span className="eyebrow">Jogo Egípcio Online</span>
          <h1>A Jornada Noturna de Rá</h1>
        </div>

        <div className="status-pill">
          Phaser + React ativos
        </div>
      </div>

      <section className="game-shell">
        <div className="game-canvas" ref={gameRef} />
      </section>
    </main>
  )
}
