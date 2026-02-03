export class Input {
  constructor(
    private onMoveX: (dx: number) => void,
    private onMoveZ: (dz: number) => void,
    private onRotateX: (clockwise: boolean) => void,
    private onRotateY: (clockwise: boolean) => void,
    private onRotateZ: (clockwise: boolean) => void,
    private onHardDrop: () => void,
    private onHold: () => void,
  ) {
    window.addEventListener('keydown', (e) => {
      // Movement
      if (e.key === 'ArrowLeft') this.onMoveX(-1)
      if (e.key === 'ArrowRight') this.onMoveX(1)
      if (e.key === 'ArrowUp') this.onMoveZ(-1)
      if (e.key === 'ArrowDown') this.onMoveZ(1)

      // Rotation
      if (e.key === 'w' || e.key === 'W') this.onRotateX(true)
      if (e.key === 's' || e.key === 'S') this.onRotateX(false)

      if (e.key === 'd' || e.key === 'D') this.onRotateY(true) // Yaw Right
      if (e.key === 'a' || e.key === 'A') this.onRotateY(false) // Yaw Left

      if (e.key === 'e' || e.key === 'E') this.onRotateZ(true) // Roll Right
      if (e.key === 'q' || e.key === 'Q') this.onRotateZ(false) // Roll Left

      // Drop
      if (e.code === 'Space') this.onHardDrop()

      // Hold
      if (e.key === 'c' || e.key === 'C') this.onHold()
    })
  }
}
