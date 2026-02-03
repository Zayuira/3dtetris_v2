export type Axis = 'x' | 'y' | 'z'

export interface PieceDef3D {
  shape: number[][][]
  color: number
}

export const PIECES_3D: PieceDef3D[] = [
  {
    shape: [[[1, 1, 1]]],
    color: 0x00ffff, // Cyan
  },
  {
    shape: [
      [
        [1, 1],
        [1, 1],
      ],
    ],
    color: 0xffff00, // Yellow
  },
  {
    shape: [
      [
        [1, 0],
        [1, 0],
        [1, 1],
      ],
    ],
    color: 0xff8800, // Orange
  },
  {
    shape: [
      [
        [0, 1, 0],
        [1, 1, 1],
      ],
      [
        [0, 0, 0],
        [0, 0, 0],
      ],
    ],
    color: 0xaa00ff, // Purple
  },
]

export class Piece3D {
  shape: number[][][]
  color: number
  x = 4
  y = 8
  z = 4

  constructor() {
    const def = PIECES_3D[Math.floor(Math.random() * PIECES_3D.length)]
    this.shape = def.shape.map((layer) => layer.map((row) => [...row]))
    this.color = def.color
  }

  rotate(axis: Axis, clockwise = true) {
    if (axis === 'x') this.shape = this.rotateX(this.shape, clockwise)
    if (axis === 'y') this.shape = this.rotateY(this.shape, clockwise)
    if (axis === 'z') this.shape = this.rotateZ(this.shape, clockwise)
  }

  private rotateX(shape: number[][][], clockwise: boolean) {
    const Y = shape.length
    const Z = shape[0].length
    const res: number[][][] = []

    // Rotate around X axis (Y-Z plane)
    // For each x (which is the inner-most index? wait, shape[y][z][x])
    // The structure is shape[y][z][x]. So X is the inner-most.
    // We are rotating the Y and Z dimensions, keeping X constant.
    // Actually in the previous implementation:
    // for ny from Y-1 to 0: layer.push([...shape[ny][nz]])
    // This was shifting Y to Z?
    // Let's rewrite to be clearer.
    // New shape dimensions: newY = Z, newZ = Y. X stays same.
    // If we assume cube (all dimensions equal), sizes don't change.

    // Standard 2D rotation of Y-Z plane for each X slice.
    // However, the data structure is [y][z][x].
    // This makes slicing by X hard.
    // The previous implementation was:
    // for (let nz = 0; nz < Z; nz++) {
    //   const layer: number[][] = []
    //   for (let ny = Y - 1; ny >= 0; ny--) {
    //     layer.push([...shape[ny][nz]])
    //   }
    //   res.push(layer)
    // }
    // This constructs res[nz][ny] (new indices).
    // The outer loop becomes the new Y (which was Z).
    // The inner loop becomes the new Z (which was Y).
    // So newY = Z, newZ = Y.
    // And it grabs shape[oldY][oldZ] where oldZ = newY, oldY depends on loop.



    // Let's stick to the previous functional approach but adapted.
    // Clockwise (Previous): (y, z) -> (z, Y-1-y)
    // Counter-Clockwise: (y, z) -> (Z-1-z, y)

    // But we are constructing the new array, so we iterate over NEW coordinates (y', z').
    // CW: source(y, z) -> dest(z, Y-1-y). So dest(y', z') comes from source(Y-1-z', y')
    // CCW: source(y, z) -> dest(Z-1-z, y). So dest(y', z') comes from source(z', Z-1-y') -> wait.

    // Let's just use 3 steps: Transpose, then Reverse rows/cols.
    // Or just write the loops.

    // Clockwise X (rotate Y-Z plane):
    // New Y is Old Z. New Z is Old Y.
    // res[i][j] = shape[...][i]...

    // Let's just implement explicit loops for clarity.
    const newY = Z
    const newZ = Y

    for (let y = 0; y < newY; y++) {
      const layer: number[][] = []
      for (let z = 0; z < newZ; z++) {
        // We want the row for the new z position
        // shape is [y][z][x]
        // We want to construct res[y][z][x]
        // For each x, we pick the value.
        // Since x is the innermost array, we can just pick the whole row if we were rotating Z.
        // But here we are rotating Y and Z. X is preserved.

        // CW: new(y, z) = old(Y - 1 - z, y)  <-- wait, standard 2D rotation
        // old(y,z) -> new(z, Y-1-y)
        // So new(u, v) <- old(Y-1-v, u)

        // CCW: new(u, v) <- old(v, Z-1-u)

        const sourceY = clockwise ? Y - 1 - z : z
        const sourceZ = clockwise ? y : Z - 1 - y

        layer.push([...shape[sourceY][sourceZ]])
      }
      res.push(layer)
    }
    return res
  }

  private rotateY(shape: number[][][], clockwise: boolean) {
    const Y = shape.length
    const Z = shape[0].length
    const X = shape[0][0].length
    const res: number[][][] = []

    // Rotate around Y axis (X-Z plane)
    // shape[y][z][x]
    // y is preserved. z and x change.

    for (let y = 0; y < Y; y++) {
      const oldLayer = shape[y]
      // oldLayer is [z][x]
      // We want to rotate this 2D plane.
      // CW: new(z, x) <- old(Z-1-x, z)
      // CCW: new(z, x) <- old(x, X-1-z)

      const newLayer: number[][] = []
      const newZ = X
      const newX = Z

      for (let z = 0; z < newZ; z++) {
        const row: number[] = []
        for (let x = 0; x < newX; x++) {
          const sourceZ = clockwise ? Z - 1 - x : x
          const sourceX = clockwise ? z : X - 1 - z
          row.push(oldLayer[sourceZ][sourceX])
        }
        newLayer.push(row)
      }
      res.push(newLayer)
    }
    return res
  }

  private rotateZ(shape: number[][][], clockwise: boolean) {
    // Rotate around Z axis (X-Y plane)
    // shape[y][z][x]
    // z is preserved. y and x change.

    // For this one, it's easier to map since Z is the middle index.
    // We strictly just rearrange the layers? No, Z is preserved, so we iterate Z and rotate the XY plane.
    // But the structure is Layer(Y) -> Row(Z) -> Col(X).
    // So Z is the rows of the layers.
    // Wait, shape[y][z][x]
    // If we rotate around Z, we are rotating X and Y.
    // So we need to construct new layers.

    const Y = shape.length
    const Z = shape[0].length
    const X = shape[0][0].length

    const newY = X
    const newX = Y

    const res: number[][][] = []

    // We need to build [yi][zi][xi]
    for (let y = 0; y < newY; y++) {
      const layer: number[][] = []
      for (let z = 0; z < Z; z++) {
        const row: number[] = []
        for (let x = 0; x < newX; x++) {
          // CW: new(y, x) <- old(Y-1-x, y)
          // CCW: new(y, x) <- old(x, X-1-y)

          const sourceY = clockwise ? Y - 1 - x : x
          const sourceX = clockwise ? y : X - 1 - y

          // z is same
          row.push(shape[sourceY][z][sourceX])
        }
        layer.push(row)
      }
      res.push(layer)
    }
    return res
  }
}
