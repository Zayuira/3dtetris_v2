export class SoundManager {

  private sounds: Record<string, HTMLAudioElement> = {}

  constructor() {
    this.load('move', '/sounds/move.mp3')
    this.load('rotate', '/sounds/rotate.wav')
    this.load('drop', '/sounds/drop.mp3')
    this.load('line', '/sounds/rotate.wav')
    this.load('gameover', '/sounds/gameover.wav')
    this.load('menu', '/sounds/menu.wav', true)
  }

  private load(name: string, src: string, loop = false) {
    const audio = new Audio(src)
    audio.loop = loop
    this.sounds[name] = audio
  }

  private _muted = false

  get muted() {
    return this._muted
  }

  play(name: string) {
    if (this._muted) return
    const s = this.sounds[name]
    if (!s) return
    s.currentTime = 0
    s.play()
  }

  stop(name: string) {
    const s = this.sounds[name]
    if (s) s.pause()
  }

  setMuted(muted: boolean) {
    this._muted = muted
    if (muted) {
      Object.values(this.sounds).forEach((s) => s.pause())
    }
  }
}
