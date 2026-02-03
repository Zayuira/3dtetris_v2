export type Cell = number | null

export class Board3D {
  grid: Cell[][][] = []
  width: number
  height: number
  depth: number

  constructor(width = 10, height = 20, depth = 10) {
    this.width = width
    this.height = height
    this.depth = depth
    this.reset()
  }

  reset() {
    this.grid = Array.from({ length: this.height }, () =>
      Array.from({ length: this.depth }, () =>
        Array.from({ length: this.width }, () => null),
      ),
    )
  }

  isInside(x: number, y: number, z: number) {
    return (
      x >= 0 &&
      x < this.width &&
      y >= 0 &&
      y < this.height &&
      z >= 0 &&
      z < this.depth
    )
  }

  collides(shape: number[][][], px: number, py: number, pz: number): boolean {
    return shape.some((layer, y) =>
      layer.some((row, z) =>
        row.some((v, x) => {
          if (!v) return false
          const nx = px + x
          const ny = py + y
          const nz = pz + z
          return !this.isInside(nx, ny, nz) || this.grid[ny][nz] === undefined || this.grid[ny][nz][nx] !== null
        }),
      ),
    )
  }

  place(
    shape: number[][][],
    px: number,
    py: number,
    pz: number,
    color: number,
  ) {
    shape.forEach((layer, y) =>
      layer.forEach((row, z) =>
        row.forEach((v, x) => {
          if (v && this.grid[py + y] && this.grid[py + y][pz + z]) {
            this.grid[py + y][pz + z][px + x] = color
          }
        }),
      ),
    )
  }

  clearLines() {
    let lines = 0
    for (let y = 0; y < this.height; y++) {
      const layer = this.grid[y]
      if (!layer) continue
      const isFull = layer.every((row) => row.every((val) => val !== null))
      if (isFull) {
        this.grid.splice(y, 1)
        this.grid.push(
          Array.from({ length: this.depth }, () =>
            Array.from({ length: this.width }, () => null),
          ),
        )
        y-- // Check same index again since we shifted
        lines++
      }
    }
    return lines
  }
}
