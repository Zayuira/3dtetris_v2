import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Piece3D } from './Piece'

export class Renderer3D {
  scene = new THREE.Scene()
  camera!: THREE.PerspectiveCamera
  renderer!: THREE.WebGLRenderer
  controls!: OrbitControls
  root = new THREE.Group()
  nextPieceGroup = new THREE.Group()
  holdPieceGroup = new THREE.Group()
  geometry = new THREE.BoxGeometry(0.9, 0.9, 0.9)

  width: number
  height: number
  depth: number

  constructor(width = 10, height = 20, depth = 10) {
    this.width = width
    this.height = height
    this.depth = depth

    this.scene.background = new THREE.Color(0x222222)

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(this.renderer.domElement)

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(10, 20, 10)
    this.scene.add(dirLight)

    const backLight = new THREE.DirectionalLight(0xffffff, 0.5)
    backLight.position.set(-10, 10, -10)
    this.scene.add(backLight)

    this.scene.add(this.root)
    this.scene.add(this.nextPieceGroup)
    this.scene.add(this.holdPieceGroup)

    this.updateBoardSize(width, height, depth)
  }

  updateBoardSize(width: number, height: number, depth: number) {
    this.width = width
    this.height = height
    this.depth = depth

    // Reset camera target
    this.controls.target.set(width / 2, height / 2, depth / 2)
    this.camera.position.set(width * 2, height + 10, depth * 2)
    this.controls.update()

    // Clear old visual helpers
    this.root.clear()

    // Bounding Box
    const boxGeo = new THREE.BoxGeometry(width, height, depth)
    const edges = new THREE.EdgesGeometry(boxGeo)
    const boundaryMat = new THREE.LineBasicMaterial({ color: 0x444444 })
    const wire = new THREE.LineSegments(edges, boundaryMat)
    wire.position.set(width / 2 - 0.5, height / 2 - 0.5, depth / 2 - 0.5)
    this.root.add(wire)

    // Notebook-style Grid (Floor and Walls)
    const gridColor = 0x444444
    const gridGroup = new THREE.Group()
    gridGroup.name = 'notebookGrid'
    const lineMat = new THREE.LineBasicMaterial({ color: gridColor, transparent: true, opacity: 0.5 })

    // Floor lines (XZ Plane)
    const floorGeo = new THREE.BufferGeometry()
    const floorPts = []
    for (let i = 0; i <= width; i++) floorPts.push(i - 0.5, -0.5, -0.5, i - 0.5, -0.5, depth - 0.5)
    for (let i = 0; i <= depth; i++) floorPts.push(-0.5, -0.5, i - 0.5, width - 0.5, -0.5, i - 0.5)
    floorGeo.setAttribute('position', new THREE.Float32BufferAttribute(floorPts, 3))
    gridGroup.add(new THREE.LineSegments(floorGeo, lineMat))

    // Back wall lines (XY plane at z = depth - 0.5)
    const backGeo = new THREE.BufferGeometry()
    const backPts = []
    for (let i = 0; i <= width; i++) backPts.push(i - 0.5, -0.5, depth - 0.5, i - 0.5, height - 0.5, depth - 0.5)
    for (let i = 0; i <= height; i++) backPts.push(-0.5, i - 0.5, depth - 0.5, width - 0.5, i - 0.5, depth - 0.5)
    backGeo.setAttribute('position', new THREE.Float32BufferAttribute(backPts, 3))
    gridGroup.add(new THREE.LineSegments(backGeo, lineMat))

    // Side wall lines (ZY plane at x = -0.5)
    const sideGeo = new THREE.BufferGeometry()
    const sidePts = []
    for (let i = 0; i <= depth; i++) sidePts.push(-0.5, -0.5, i - 0.5, -0.5, height - 0.5, i - 0.5)
    for (let i = 0; i <= height; i++) sidePts.push(-0.5, i - 0.5, -0.5, -0.5, i - 0.5, depth - 0.5)
    sideGeo.setAttribute('position', new THREE.Float32BufferAttribute(sidePts, 3))
    gridGroup.add(new THREE.LineSegments(sideGeo, lineMat))

    this.root.add(gridGroup)

    // Position "Next Piece" display area (to the right of the board)
    this.nextPieceGroup.position.set(width + 5, height - 2, depth / 2)
    this.holdPieceGroup.position.set(-5, height - 2, depth / 2)
  }

  drawBoard(grid: (number | null)[][][]) {
    const boardContent = this.root.getObjectByName('boardContent')
    if (boardContent) {
      this.root.remove(boardContent)
    }
    const newBoardContent = new THREE.Group()
    newBoardContent.name = 'boardContent'

    grid.forEach((layer, y) =>
      layer.forEach((row, z) =>
        row.forEach((color, x) => {
          if (!color) return
          const mat = new THREE.MeshStandardMaterial({
            color,
            roughness: 0.1,
            metalness: 0.1
          })
          const cube = new THREE.Mesh(this.geometry, mat)
          cube.position.set(x, y, z)
          newBoardContent.add(cube)
        }),
      ),
    )
    this.root.add(newBoardContent)
  }

  drawPiece(piece: Piece3D) {
    const pieceGroup = this.root.getObjectByName('activePiece')
    if (pieceGroup) this.root.remove(pieceGroup)

    const group = new THREE.Group()
    group.name = 'activePiece'
    const mat = new THREE.MeshStandardMaterial({
      color: piece.color,
      roughness: 0.1,
      metalness: 0.1
    })

    piece.shape.forEach((layer, y) =>
      layer.forEach((row, z) =>
        row.forEach((v, x) => {
          if (!v) return
          const cx = piece.x + x
          const cy = piece.y + y
          const cz = piece.z + z

          const cube = new THREE.Mesh(this.geometry, mat)
          cube.position.set(cx, cy, cz)
          group.add(cube)
        }),
      ),
    )

    this.root.add(group)
  }

  drawGhostPiece(piece: Piece3D, ghostY: number) {
    const ghostGroup = this.root.getObjectByName('ghostPiece')
    if (ghostGroup) this.root.remove(ghostGroup)

    const group = new THREE.Group()
    group.name = 'ghostPiece'
    const mat = new THREE.MeshBasicMaterial({
      color: piece.color,
      transparent: true,
      opacity: 0.3,
      depthWrite: false
    })

    piece.shape.forEach((layer, y) =>
      layer.forEach((row, z) =>
        row.forEach((v, x) => {
          if (!v) return
          const cx = piece.x + x
          const cy = ghostY + y
          const cz = piece.z + z

          const cube = new THREE.Mesh(this.geometry, mat)
          cube.position.set(cx, cy, cz)
          group.add(cube)
        }),
      ),
    )

    this.root.add(group)
  }

  drawNextPiece(piece: Piece3D) {
    this.nextPieceGroup.clear()
    const mat = new THREE.MeshStandardMaterial({
      color: piece.color,
      roughness: 0.1,
      metalness: 0.1
    })

    piece.shape.forEach((layer, y) =>
      layer.forEach((row, z) =>
        row.forEach((v, x) => {
          if (!v) return
          const cube = new THREE.Mesh(this.geometry, mat)
          cube.position.set(x, y, z)
          this.nextPieceGroup.add(cube)
        })
      )
    )
  }

  drawHoldPiece(piece: Piece3D) {
    this.holdPieceGroup.clear()
    const mat = new THREE.MeshStandardMaterial({
      color: piece.color,
      roughness: 0.1,
      metalness: 0.1
    })

    piece.shape.forEach((layer, y) =>
      layer.forEach((row, z) =>
        row.forEach((v, x) => {
          if (!v) return
          const cube = new THREE.Mesh(this.geometry, mat)
          cube.position.set(x, y, z)
          this.holdPieceGroup.add(cube)
        })
      )
    )
  }

  render() {
    this.controls.update()
    this.renderer.render(this.scene, this.camera)
  }
}
