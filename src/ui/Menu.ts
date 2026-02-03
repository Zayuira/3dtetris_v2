import { SoundManager } from '../audio/SoundManager'

export class Menu {
  soundOn: boolean

  constructor(
    private root: HTMLElement,
    private soundBtn: HTMLButtonElement,
    private sounds: SoundManager,
  ) {
    this.soundOn = true
    this.soundBtn.onclick = () => this.toggleSound()
  }

  toggleSound() {
    this.soundOn = !this.soundOn
    this.sounds.setMuted(!this.soundOn)
    this.soundBtn.textContent = this.soundOn ? '🔊 Sound: ON' : '🔇 Sound: OFF'
  }

  hide() {
    this.root.style.display = 'none'
  }

  show() {
    this.root.style.display = 'flex'
    // Update high score display when showing menu
    const saved = localStorage.getItem('tetris3d_highscore')
    const score = saved ? parseInt(saved) : 0
    const el = document.getElementById('highScoreMenu')
    if (el) el.textContent = score.toString()
  }

  getSelectedSize() {
    const radios = document.getElementsByName('boardSize') as NodeListOf<HTMLInputElement>
    let val = '10,20,10'
    radios.forEach(r => {
      if (r.checked) val = r.value
    })
    const parts = val.split(',').map(Number)
    return { width: parts[0], height: parts[1], depth: parts[2] }
  }
}
