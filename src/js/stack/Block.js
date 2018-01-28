'use strict'

import {
  Color,
  BoxGeometry,
  Matrix4,
  MeshToonMaterial,
  Mesh
} from 'three'
import { TweenLite } from "gsap"

export default class Block {

  MOVE_AMOUNT = 12
  STATES = {
    ACTIVE: 'active',
    STOPPED: 'stopped',
    MISSED: 'missed'
  }

  math = Math
  dimension = {
    width: 0,
    height: 0,
    depth: 0
  }
  position = {
    x: 0,
    y: 0,
    z: 0
  }

  targetBlock
  index
  workingPlane
  workingDimension
  colorOffset
  color
  state
  speed
  direction
  material
  mesh

  constructor(block) {
    this.targetBlock = block

    this.index = (this.targetBlock ? this.targetBlock.index : 0) + 1
    this.workingPlane = this.index % 2 ? 'x' : 'z'
    this.workingDimension = this.index % 2 ? 'width' : 'depth'

    this.dimension.width = this.targetBlock ? this.targetBlock.dimension.width : 10
    this.dimension.height = this.targetBlock ? this.targetBlock.dimension.height : 2
    this.dimension.depth = this.targetBlock ? this.targetBlock.dimension.depth : 10

    this.position.x = this.targetBlock ? this.targetBlock.position.x : 0
    this.position.y = this.dimension.height * this.index
    this.position.z = this.targetBlock ? this.targetBlock.position.z : 0

    this.generateBlockColor()

    this.state = this.index > 1
      ? this.STATES.ACTIVE
      : this.STATES.STOPPED

    this.speed = -0.1 - (this.index * 0.005)
    if (this.speed < -4) {
      this.speed = -4
    }
    this.direction = this.speed

    let boxGeometry = new BoxGeometry(
      this.dimension.width,
      this.dimension.height,
      this.dimension.depth
    )
    boxGeometry.applyMatrix(
      new Matrix4().makeTranslation(
        this.dimension.width / 2,
        this.dimension.height / 2,
        this.dimension.depth / 2
      )
    )
    this.material = new MeshToonMaterial({
      color: this.color,
      flatShading: true
    })
    this.mesh = new Mesh(boxGeometry, this.material)
    this.mesh.position.set(
      this.position.x,
      this.position.y + (this.state == this.STATES.ACTIVE ? 0 : 0),
      this.position.z
    )

    if (this.state == this.STATES.ACTIVE) {
      this.position[this.workingPlane] = this.math.random() > 0.5
        ? -this.MOVE_AMOUNT
        : this.MOVE_AMOUNT
    }
  }

  generateBlockColor() {
    this.colorOffset = this.targetBlock
      ? this.targetBlock.colorOffset
      : this.math.round(this.math.random() * 100)

    if (!this.targetBlock) {
      this.color = 0x333344
    } else {
      let offset = this.index + this.colorOffset
      let red = this.math.sin(0.3 * offset) * 55 + 200
      let green = this.math.sin(0.3 * offset + 2) * 55 + 200
      let blue = this.math.sin(0.3 * offset + 4) * 55 + 200

      this.color = new Color(red / 255, green / 255, blue / 255 )
    }
  }

  reverseDirection() {
    this.direction = this.direction > 0
      ? this.speed
      : this.math.abs(this.speed)
  }

  place() {
    this.state = this.STATES.STOPPED

    let overlap = this.targetBlock.dimension[this.workingDimension]
      -this.math.abs(
        this.position[this.workingPlane]
        -this.targetBlock.position[this.workingPlane]
      )

    let blocksToReturn = {
      plane: this.workingPlane,
      direction: this.direction
    }

    if (this.dimension[this.workingDimension] - overlap < 0.3) {
      overlap = this.dimension[this.workingDimension]
      blocksToReturn.bonus = true
      this.position.x = this.targetBlock.position.x
      this.position.z = this.targetBlock.position.z
      this.dimension.width = this.targetBlock.dimension.width
      this.dimension.depth = this.targetBlock.dimension.depth
    }

    if (overlap > 0) {
      let choppedBoxDimensions = {
        width: this.dimension.width,
        height: this.dimension.height,
        depth: this.dimension.depth
      }
      choppedBoxDimensions[this.workingDimension] -= overlap
      this.dimension[this.workingDimension] = overlap

      let placedBoxGeometry = new BoxGeometry(this.dimension.width, this.dimension.height, this.dimension.depth)
      placedBoxGeometry.applyMatrix(
        new Matrix4().makeTranslation(
          this.dimension.width / 2,
          this.dimension.height / 2,
          this.dimension.depth / 2
        )
      )
      let placedMesh = new Mesh(placedBoxGeometry, this.material)

      let choppedBoxGeometry = new BoxGeometry(
        choppedBoxDimensions.width,
        choppedBoxDimensions.height,
        choppedBoxDimensions.depth
      )
      choppedBoxGeometry.applyMatrix(
        new Matrix4().makeTranslation(
          choppedBoxDimensions.width / 2,
          choppedBoxDimensions.height / 2,
          choppedBoxDimensions.depth / 2
        )
      )
      let choppedBoxMesh = new Mesh(choppedBoxGeometry, this.material)

      let choppedBoxPosition = {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z
      }

      if (this.position[this.workingPlane] < this.targetBlock.position[this.workingPlane]) {
        this.position[this.workingPlane] = this.targetBlock.position[this.workingPlane]
      } else {
        choppedBoxPosition[this.workingPlane] += overlap
      }

      placedMesh.position.set(this.position.x, this.position.y, this.position.z)
      choppedBoxMesh.position.set(choppedBoxPosition.x, choppedBoxPosition.y, choppedBoxPosition.z)

      blocksToReturn.placed = placedMesh
      if (!blocksToReturn.bonus) {
        blocksToReturn.chopped = choppedBoxMesh
      }
    } else {
      this.state = this.STATES.MISSED
    }

    this.dimension[this.workingDimension] = overlap

    return blocksToReturn
  }

  tick() {
    if (this.state == this.STATES.ACTIVE) {
      let value = this.position[this.workingPlane]
      if(value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT) {
        this.reverseDirection()
      }
      this.position[this.workingPlane] += this.direction
      this.mesh.position[this.workingPlane] = this.position[this.workingPlane]
    }
  }
}
