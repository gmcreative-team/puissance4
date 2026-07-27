import { describe, it, expect } from 'vitest'
import {
    createEmptyBoard,
    dropDisc,
    checkWinner,
    isBoardFull,
    getBestMove,
    ROWS,
    COLS
} from './gameLogic'

describe('createEmptyBoard', () => {
    it('crée une grille aux bonnes dimensions, entièrement vide', () => {
        const board = createEmptyBoard()
        expect(board.length).toBe(ROWS)
        expect(board[0].length).toBe(COLS)
        expect(board.flat().every(cell => cell === null)).toBe(true)
    })
})

describe('dropDisc', () => {
    it('place le pion sur la ligne du bas dans une colonne vide', () => {
        const board = createEmptyBoard()
        const result = dropDisc(board, 3, 'red')
        expect(result.row).toBe(ROWS - 1)
        expect(result.board[ROWS - 1][3]).toBe('red')
    })

    it('empile les pions les uns sur les autres', () => {
        let board = createEmptyBoard()
        board = dropDisc(board, 2, 'red').board
        const result = dropDisc(board, 2, 'yellow')
        expect(result.row).toBe(ROWS - 2)
    })

    it('retourne null quand la colonne est pleine', () => {
        let board = createEmptyBoard()
        for (let i = 0; i < ROWS; i++) {
            board = dropDisc(board, 0, 'red').board
        }
        const result = dropDisc(board, 0, 'yellow')
        expect(result).toBeNull()
    })
})

describe('checkWinner', () => {
    it('détecte une victoire horizontale', () => {
        let board = createEmptyBoard()
        for (let c = 0; c < 4; c++) {
            board = dropDisc(board, c, 'red').board
        }
        expect(checkWinner(board)).toBe('red')
    })

    it('détecte une victoire verticale', () => {
        let board = createEmptyBoard()
        for (let i = 0; i < 4; i++) {
            board = dropDisc(board, 1, 'yellow').board
        }
        expect(checkWinner(board)).toBe('yellow')
    })

    it('détecte une victoire en diagonale', () => {
        let board = createEmptyBoard()
        const moves = [
            [0, 'red'],
            [1, 'yellow'], [1, 'red'],
            [2, 'yellow'], [2, 'yellow'], [2, 'red'],
            [3, 'yellow'], [3, 'yellow'], [3, 'yellow'], [3, 'red']
        ]
        for (const [col, player] of moves) {
            board = dropDisc(board, col, player).board
        }
        expect(checkWinner(board)).toBe('red')
    })

    it("retourne null quand il n'y a pas de gagnant", () => {
        const board = createEmptyBoard()
        expect(checkWinner(board)).toBeNull()
    })
})

describe('isBoardFull', () => {
    it('retourne false sur une grille vide', () => {
        expect(isBoardFull(createEmptyBoard())).toBe(false)
    })

    it('retourne true quand toutes les colonnes sont pleines', () => {
        let board = createEmptyBoard()
        for (let c = 0; c < COLS; c++) {
            for (let r = 0; r < ROWS; r++) {
                board = dropDisc(board, c, r % 2 === 0 ? 'red' : 'yellow').board
            }
        }
        expect(isBoardFull(board)).toBe(true)
    })
})

describe('getBestMove (IA)', () => {
    it('joue le coup gagnant quand il est disponible', () => {
        let board = createEmptyBoard()
        // l'IA (yellow) a trois pions alignés en bas, colonne 3 est le coup gagnant
        board = dropDisc(board, 0, 'yellow').board
        board = dropDisc(board, 1, 'yellow').board
        board = dropDisc(board, 2, 'yellow').board
        board = dropDisc(board, 0, 'red').board
        board = dropDisc(board, 1, 'red').board

        const move = getBestMove(board, 'yellow', 4)
        expect(move).toBe(3)
    })

    it("bloque le coup gagnant de l'adversaire", () => {
        let board = createEmptyBoard()
        // le joueur humain (red) a trois pions alignés, l'IA doit bloquer en colonne 3
        board = dropDisc(board, 0, 'red').board
        board = dropDisc(board, 1, 'red').board
        board = dropDisc(board, 2, 'red').board
        board = dropDisc(board, 5, 'yellow').board
        board = dropDisc(board, 6, 'yellow').board

        const move = getBestMove(board, 'yellow', 4)
        expect(move).toBe(3)
    })
})