import { Board3D } from './Board'
import { Piece3D } from './Piece'
import { Input } from './Input'
import { Renderer3D } from './Renderer3D'
import { SoundManager } from '../audio/SoundManager'

export enum GameState {
  MENU,
  PLAYING,
  PAUSED,
  GAMEOVER,
}

export class Game {
  board = new Board3D()
  piece = new Piece3D()
  nextPiece = new Piece3D()
  renderer: Renderer3D
  sounds: SoundManager
  input!: Input

  dropTimer = 0
  dropInterval = 1200
  lastTime = 0
  state = GameState.MENU

  score = 0
  highScore = 0
  holdPiece: Piece3D | null = null
  canHold = true

  onScoreChange: (score: number, highScore: number) => void = () => { }
  onGameOver: () => void = () => { }
  onNextPiece: (piece: Piece3D) => void = () => { }

  constructor(sounds: SoundManager) {
    this.sounds = sounds
    // Initialize renderer with default board
    this.renderer = new Renderer3D(this.board.width, this.board.height, this.board.depth)

    // Load high score
    const saved = localStorage.getItem('tetris3d_highscore')
    if (saved) this.highScore = parseInt(saved)
  }

  start(width = 10, height = 20, depth = 10) {
    this.board = new Board3D(width, height, depth)
    this.renderer.updateBoardSize(width, height, depth)
    this.reset()

    this.nextPiece = new Piece3D()
    this.spawn()

    this.input = new Input(
      (dx) => this.moveX(dx),
      (dz) => this.moveZ(dz),
      (cw) => this.rotateX(cw),
      (cw) => this.rotateY(cw),
      (cw) => this.rotateZ(cw),
      () => this.hardDrop(),
      () => this.hold(),
    )

    this.state = GameState.PLAYING
    this.lastTime = performance.now()
    this.loop(this.lastTime)
  }

  reset() {
    this.score = 0
    this.holdPiece = null
    this.canHold = true
    this.onScoreChange(this.score, this.highScore)
    this.dropInterval = 1200
  }

  spawn() {
    this.piece = this.nextPiece
    this.nextPiece = new Piece3D()
    this.canHold = true
    this.onNextPiece(this.nextPiece)

    this.piece.x = Math.floor(this.board.width / 2) - 1
    this.piece.y = this.board.height - this.piece.shape.length
    this.piece.z = Math.floor(this.board.depth / 2) - 1

    if (
      this.board.collides(
        this.piece.shape,
        this.piece.x,
        this.piece.y,
        this.piece.z,
      )
    ) {
      this.gameOver()
    }
  }

  hold() {
    if (this.state !== GameState.PLAYING || !this.canHold) return

    if (!this.holdPiece) {
      this.holdPiece = this.piece
      this.spawn()
    } else {
      const temp = this.piece
      this.piece = this.holdPiece
      this.holdPiece = temp

      this.piece.x = Math.floor(this.board.width / 2) - 1
      this.piece.y = this.board.height - this.piece.shape.length
      this.piece.z = Math.floor(this.board.depth / 2) - 1
    }

    this.canHold = false
    this.sounds.play('rotate') // Play a sound for hold
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING
      this.lastTime = performance.now()
      this.loop(this.lastTime)
    }
  }

  getGhostY() {
    let y = this.piece.y
    while (
      !this.board.collides(
        this.piece.shape,
        this.piece.x,
        y - 1,
        this.piece.z,
      )
    ) {
      y--
    }
    return y
  }

  moveX(dx: number) {
    if (this.state !== GameState.PLAYING) return
    if (
      !this.board.collides(
        this.piece.shape,
        this.piece.x + dx,
        this.piece.y,
        this.piece.z,
      )
    ) {
      this.piece.x += dx
      this.sounds.play('move')
    }
  }

  moveZ(dz: number) {
    if (this.state !== GameState.PLAYING) return
    if (
      !this.board.collides(
        this.piece.shape,
        this.piece.x,
        this.piece.y,
        this.piece.z + dz,
      )
    ) {
      this.piece.z += dz
      this.sounds.play('move')
    }
  }

  rotateX(clockwise: boolean) {
    if (this.state !== GameState.PLAYING) return
    const old = structuredClone(this.piece.shape)
    this.piece.rotate('x', clockwise)
    if (
      this.board.collides(
        this.piece.shape,
        this.piece.x,
        this.piece.y,
        this.piece.z,
      )
    ) {
      this.piece.shape = old
    } else {
      this.sounds.play('rotate')
    }
  }

  rotateY(clockwise: boolean) {
    if (this.state !== GameState.PLAYING) return
    const old = structuredClone(this.piece.shape)
    this.piece.rotate('y', clockwise)
    if (
      this.board.collides(
        this.piece.shape,
        this.piece.x,
        this.piece.y,
        this.piece.z,
      )
    ) {
      this.piece.shape = old
    } else {
      this.sounds.play('rotate')
    }
  }

  rotateZ(clockwise: boolean) {
    if (this.state !== GameState.PLAYING) return
    const old = structuredClone(this.piece.shape)
    this.piece.rotate('z', clockwise)
    if (
      this.board.collides(
        this.piece.shape,
        this.piece.x,
        this.piece.y,
        this.piece.z,
      )
    ) {
      this.piece.shape = old
    } else {
      this.sounds.play('rotate')
    }
  }

  hardDrop() {
    if (this.state !== GameState.PLAYING) return
    while (
      !this.board.collides(
        this.piece.shape,
        this.piece.x,
        this.piece.y - 1,
        this.piece.z,
      )
    ) {
      this.piece.y--
    }
    this.lock()
  }

  lock() {
    this.board.place(
      this.piece.shape,
      this.piece.x,
      this.piece.y,
      this.piece.z,
      this.piece.color,
    )
    const lines = this.board.clearLines()
    if (lines > 0) {
      this.score += lines * 100
      if (this.score > this.highScore) {
        this.highScore = this.score
        localStorage.setItem('tetris3d_highscore', this.highScore.toString())
      }
      this.onScoreChange(this.score, this.highScore)
      this.sounds.play('line')
      // Increase speed slightly
      this.dropInterval = Math.max(100, 1200 - (this.score / 500) * 100)
    } else {
      this.sounds.play('drop')
    }
    this.spawn()
  }

  update(dt: number) {
    if (this.state !== GameState.PLAYING) return
    this.dropTimer += dt
    if (this.dropTimer > this.dropInterval) {
      if (
        !this.board.collides(
          this.piece.shape,
          this.piece.x,
          this.piece.y - 1,
          this.piece.z,
        )
      ) {
        this.piece.y--
      } else {
        this.lock()
      }
      this.dropTimer = 0
    }
  }

  render() {
    this.renderer.drawBoard(this.board.grid)
    this.renderer.drawPiece(this.piece)
    this.renderer.drawGhostPiece(this.piece, this.getGhostY())
    this.renderer.drawNextPiece(this.nextPiece)
    if (this.holdPiece) this.renderer.drawHoldPiece(this.holdPiece)
    this.renderer.render()
  }

  loop = (time: number) => {
    if (this.state !== GameState.PLAYING) return
    const dt = time - this.lastTime
    this.lastTime = time
    this.update(dt)
    this.render()
    requestAnimationFrame(this.loop)
  }

  gameOver() {
    this.state = GameState.GAMEOVER
    this.sounds.play('gameover')
    this.onGameOver()
  }
}
