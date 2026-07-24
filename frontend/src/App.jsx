import { useState } from 'react'
import './App.css'

const ROWS = 6
const COLS = 7

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

function checkWinner(board) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ]

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const player = board[r][c]
      if (!player) continue

      for (const [dr, dc] of directions) {
        let count = 1
        let rr = r + dr
        let cc = c + dc
        while (
            rr >= 0 && rr < ROWS &&
            cc >= 0 && cc < COLS &&
            board[rr][cc] === player
            ) {
          count++
          if (count === 4) return player
          rr += dr
          cc += dc
        }
      }
    }
  }
  return null
}

function App() {
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [winner, setWinner] = useState(null)

  const handleColumnClick = (col) => {
    if (winner) return

    const newBoard = board.map(row => [...row])
    let placedRow = -1
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!newBoard[r][col]) {
        newBoard[r][col] = currentPlayer
        placedRow = r
        break
      }
    }
    if (placedRow === -1) return // colonne pleine

    setBoard(newBoard)

    const win = checkWinner(newBoard)
    if (win) {
      setWinner(win)
      saveScore(win)
    } else {
      setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
    }
  }

  const resetGame = () => {
    setBoard(createEmptyBoard())
    setCurrentPlayer('red')
    setWinner(null)
  }

  const saveScore = async (player) => {
    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner: player, date: new Date().toISOString() })
      })
    } catch (e) {
      console.warn('Impossible d\'enregistrer le score', e)
    }
  }

  return (
      <div className="app">
        <h1>Puissance 4</h1>

        {winner ? (
            <p className="status">🎉 {winner === 'red' ? 'Rouge' : 'Jaune'} a gagné !</p>
        ) : (
            <p className="status">Au tour de : {currentPlayer === 'red' ? 'Rouge' : 'Jaune'}</p>
        )}

        <div className="board">
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