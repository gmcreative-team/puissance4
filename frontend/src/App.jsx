import { useState, useEffect } from 'react'
import './App.css'
import {
  createEmptyBoard,
  dropDisc,
  checkWinner,
  isBoardFull,
  getBestMove
} from './gameLogic'

const HUMAN = 'red'
const AI = 'yellow'

const DIFFICULTY_DEPTHS = {
  easy: 2,
  medium: 4,
  hard: 6
}

function App() {
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState(HUMAN)
  const [winner, setWinner] = useState(null)
  const [isDraw, setIsDraw] = useState(false)
  const [mode, setMode] = useState('pvp') // 'pvp' | 'ai'
  const [difficulty, setDifficulty] = useState('medium')
  const [aiThinking, setAiThinking] = useState(false)

  const isAiTurn = mode === 'ai' && currentPlayer === AI && !winner && !isDraw

  const playMove = (col, player) => {
    const result = dropDisc(board, col, player)
    if (!result) return false // colonne pleine

    const newBoard = result.board
    setBoard(newBoard)

    const win = checkWinner(newBoard)
    if (win) {
      setWinner(win)
      saveScore(win)
      return true
    }

    if (isBoardFull(newBoard)) {
      setIsDraw(true)
      return true
    }

    setCurrentPlayer(player === 'red' ? 'yellow' : 'red')
    return true
  }

  const handleColumnClick = (col) => {
    if (winner || isDraw) return
    if (mode === 'ai' && currentPlayer !== HUMAN) return
    playMove(col, currentPlayer)
  }

  useEffect(() => {
    if (!isAiTurn) return

    setAiThinking(true)
    const timer = setTimeout(() => {
      const depth = DIFFICULTY_DEPTHS[difficulty]
      const col = getBestMove(board, AI, depth)
      if (col !== null && col !== undefined) {
        playMove(col, AI)
      }
      setAiThinking(false)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 400)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiTurn, board])

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer(HUMAN)
    setWinner(null)
    setIsDraw(false)
    setAiThinking(false)
  }

  const changeMode = (newMode) => {
    setMode(newMode)
    resetGame()
  }

  const changeDifficulty = (level) => {
    setDifficulty(level)
    resetGame()
  }

  const saveScore = async (player) => {
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winner: player,
          mode,
          difficulty: mode === 'ai' ? difficulty : null,
          date: new Date().toISOString()
        })
      })
    } catch (e) {
      console.warn("Impossible d'enregistrer le score", e)
    }
  }

  const playerLabel = (player) => {
    if (mode === 'ai') {
      return player === HUMAN ? 'Toi' : 'IA'
    }
    return player === 'red' ? 'Rouge' : 'Jaune'
  }

  return (
      <div className="app">
        <h1>Puissance 4</h1>

        <div className="mode-selector">
          <button
              className={mode === 'pvp' ? 'active' : ''}
              onClick={() => changeMode('pvp')}
          >
            2 joueurs
          </button>
          <button
              className={mode === 'ai' ? 'active' : ''}
              onClick={() => changeMode('ai')}
          >
            Solo vs IA
          </button>
        </div>

        {mode === 'ai' && (
            <div className="difficulty-selector">
              {Object.keys(DIFFICULTY_DEPTHS).map((level) => (
                  <button
                      key={level}
                      className={difficulty === level ? 'active' : ''}
                      onClick={() => changeDifficulty(level)}
                  >
                    {level === 'easy' ? 'Facile' : level === 'medium' ? 'Moyen' : 'Difficile'}
                  </button>
              ))}
            </div>
        )}

        {winner ? (
            <p className="status">🎉 {playerLabel(winner)} a gagné !</p>
        ) : isDraw ? (
            <p className="status">Match nul !</p>
        ) : (
            <p className="status">
              {aiThinking ? "L'IA réfléchit..." : `Au tour de : ${playerLabel(currentPlayer)}`}
            </p>
        )}

        <div className={`board ${aiThinking ? 'disabled' : ''}`}>
          {board.map((row, r) => (
              <div className="row" key={r}>
                {row.map((cell, c) => (
                    <div
                        key={c}
                        className="cell"
                        onClick={() => handleColumnClick(c)}
                    >
                      <div className={`disc ${cell || 'empty'}`} />
                    </div>
                ))}
              </div>
          ))}
        </div>

        <button onClick={resetGame}>Nouvelle partie</button>
      </div>
  )
}

export default App