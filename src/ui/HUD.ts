export class HUD {
  private scoreEl = document.getElementById('score')!

  setScore(value: number) {
    this.scoreEl.textContent = value.toString()
  }
}
