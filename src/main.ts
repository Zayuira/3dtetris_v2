import { Game, GameState } from './game/Game'
import { Menu } from './ui/Menu'
import { SoundManager } from './audio/SoundManager'

const menuDiv = document.getElementById('menu')!
const gameOverDiv = document.getElementById('gameover')!
const startBtn = document.getElementById('startBtn')!
const soundBtn = document.getElementById('soundBtn') as HTMLButtonElement
const restartBtn = document.getElementById('restartBtn')!
const menuBtn = document.getElementById('menuBtn')!
const hud = document.getElementById('hud')!
const scoreSpan = document.getElementById('score')!
const highScoreHud = document.getElementById('highScoreHud')!
const highScoreMenu = document.getElementById('highScoreMenu')!
const finalScoreSpan = document.getElementById('finalScore')!
const pauseBtn = document.getElementById('pauseBtn')!

const sounds = new SoundManager()
const game = new Game(sounds)
const menu = new Menu(menuDiv, soundBtn, sounds)

// Initialize High Scores on Load
const savedHigh = localStorage.getItem('tetris3d_highscore')
if (savedHigh) {
  if (highScoreMenu) highScoreMenu.textContent = savedHigh
  if (highScoreHud) highScoreHud.textContent = savedHigh
}
menu.show()

game.onScoreChange = (s, hs) => {
  scoreSpan.textContent = s.toString()
  highScoreHud.textContent = hs.toString()
}

game.onGameOver = () => {
  hud.style.display = 'none'
  gameOverDiv.style.display = 'flex'
  finalScoreSpan.textContent = game.score.toString()
}

startBtn.onclick = () => {
  const size = menu.getSelectedSize()
  menu.hide()
  hud.style.display = 'block'
  game.start(size.width, size.height, size.depth)
}

restartBtn.onclick = () => {
  gameOverDiv.style.display = 'none'
  hud.style.display = 'block'
  game.start(game.board.width, game.board.height, game.board.depth)
}

menuBtn.onclick = () => {
  gameOverDiv.style.display = 'none'
  hud.style.display = 'none'
  menu.show()
  game.state = GameState.MENU
}

pauseBtn.onclick = () => {
  game.togglePause()
  pauseBtn.textContent = game.state === GameState.PAUSED ? '▶️ Resume' : '⏸️ Pause'
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    game.togglePause()
    pauseBtn.textContent = game.state === GameState.PAUSED ? '▶️ Resume' : '⏸️ Pause'
  }
})
