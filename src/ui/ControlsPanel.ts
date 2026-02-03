export class ControlsPanel {
  root = document.createElement('div')

  constructor() {
    this.root.style.position = 'absolute'
    this.root.style.right = '20px'
    this.root.style.top = '50%'
    this.root.style.transform = 'translateY(-50%)'
    this.root.style.fontSize = '14px'
    this.root.innerHTML = `
      <h3>Controls</h3>
      ⬅ / ➡ : Move<br/>
      ⬇ : Soft Drop<br/>
      ⬆ : Rotate Z<br/>
      A : Rotate X<br/>
      D : Rotate Y<br/>
      R : Reset Camera
    `
    document.body.appendChild(this.root)
  }
}
