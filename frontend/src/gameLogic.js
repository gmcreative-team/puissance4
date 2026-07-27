export const ROWS = 6
export const COLS = 7

export function createEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null))
}

export function getValidColumns(board) {
    const cols = []
    for (let c = 0; c < COLS; c++) {
        if (board[0][c] === null) cols.push(c)
    }
    return cols
}

export function dropDisc(board, col, player) {
    const newBoard = board.map(row => [...row])
    for (let r = ROWS - 1; r >= 0; r--) {
        if (!newBoard[r][col]) {
            newBoard[r][col] = player
            return { board: newBoard, row: r }
        }
    }
    return null // colonne pleine
}

export function isBoardFull(board) {
    return getValidColumns(board).length === 0
}

export function checkWinner(board) {
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

function evaluateWindow(window, player, opponent) {
    let score = 0
    const countPlayer = window.filter(c => c === player).length
    const countOpp = window.filter(c => c === opponent).length
    const countEmpty = window.filter(c => c === null).length

    if (countPlayer === 4) score += 100
    else if (countPlayer === 3 && countEmpty === 1) score += 5
    else if (countPlayer === 2 && countEmpty === 2) score += 2

    if (countOpp === 3 && countEmpty === 1) score -= 4

    return score
}

function evaluateBoard(board, player) {
    const opponent = player === 'red' ? 'yellow' : 'red'
    let score = 0

    const centerCol = Math.floor(COLS / 2)
    const centerCount = board.reduce(
        (acc, row) => acc + (row[centerCol] === player ? 1 : 0),
        0
    )
    score += centerCount * 3

    // Horizontal
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]]
            score += evaluateWindow(window, player, opponent)
        }
    }

    // Vertical
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 3; r++) {
            const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]]
            score += evaluateWindow(window, player, opponent)
        }
    }

    // Diagonale montante /
    for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]]
            score += evaluateWindow(window, player, opponent)
        }
    }

    // Diagonale descendante \
    for (let r = 3; r < ROWS; r++) {
        for (let c = 0; c < COLS - 3; c++) {
            const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]]
            score += evaluateWindow(window, player, opponent)
        }
    }

    return score
}

function orderedColumns(board) {
    const valid = getValidColumns(board)
    const center = Math.floor(COLS / 2)
    return valid.sort((a, b) => Math.abs(a - center) - Math.abs(b - center))
}

function minimax(board, depth, alpha, beta, maximizing, aiPlayer, humanPlayer) {
    const winner = checkWinner(board)
    const validCols = getValidColumns(board)

    if (winner === aiPlayer) return [1000000 + depth, null]
    if (winner === humanPlayer) return [-1000000 - depth, null]
    if (validCols.length === 0) return [0, null]
    if (depth === 0) return [evaluateBoard(board, aiPlayer), null]

    const cols = orderedColumns(board)

    if (maximizing) {
        let value = -Infinity
        let bestCol = cols[0]
        for (const col of cols) {
            const { board: newBoard } = dropDisc(board, col, aiPlayer)
            const [score] = minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer, humanPlayer)
            if (score > value) {
                value = score
                bestCol = col
            }
            alpha = Math.max(alpha, value)
            if (alpha >= beta) break
        }
        return [value, bestCol]
    } else {
        let value = Infinity
        let bestCol = cols[0]
        for (const col of cols) {
            const { board: newBoard } = dropDisc(board, col, humanPlayer)
            const [score] = minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer, humanPlayer)
            if (score < value) {
                value = score
                bestCol = col
            }
            beta = Math.min(beta, value)
            if (alpha >= beta) break
        }
        return [value, bestCol]
    }
}

/**
 * Retourne la meilleure colonne à jouer pour aiPlayer.
 * depth contrôle la difficulté : plus il est élevé, plus l'IA anticipe (et plus c'est lent).
 */
export function getBestMove(board, aiPlayer, depth = 4) {
    const humanPlayer = aiPlayer === 'red' ? 'yellow' : 'red'
    const [, bestCol] = minimax(board, depth, -Infinity, Infinity, true, aiPlayer, humanPlayer)
    return bestCol
}