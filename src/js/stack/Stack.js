'use strict'

import { Group } from 'three'
import { TweenLite } from "gsap"

import Stage from './Stage'
import Block from './Block'

export default class Stack {

  INITIAL_SCORE = '0'
  STATES = {
    LOADING: 'loading',
    PLAYING: 'playing',
    READY: 'ready',
    ENDED: 'ended',
    RESETTING: 'resetting'
  }
  HTML_IDS = {
    CONTAINER: 'container',
    SCORE: 'score',
    INSTRUCTIONS: 'instructions',
    START_BUTTON: 'start-button'
  }

  math = Math
  blocks = []
  state = this.STATES.LOADING

  mainContainer
  scoreContainer
  instructions
  startButton
  newBlocks
  placedBlocks
  choppedBlocks

  constructor() {
    this.stage = new Stage()

    this.mainContainer = document.getElementById(this.HTML_IDS.CONTAINER)
    this.scoreContainer = document.getElementById(this.HTML_IDS.SCORE)
    this.instructions = document.getElementById(this.HTML_IDS.INSTRUCTIONS)
    this.startButton = document.getElementById(this.HTML_IDS.START_BUTTON)
    this.scoreContainer.innerHTML = this.INITIAL_SCORE

    this.newBlocks = new Group()
    this.placedBlocks = new Group()
    this.choppedBlocks = new Group()

    this.stage.add(this.newBlocks)
    this.stage.add(this.placedBlocks)
    this.stage.add(this.choppedBlocks)

    this.addBlock()
    this.tick()
    this.updateState(this.STATES.READY)
    this.registerListeners()
  }

  registerListeners() {
    let spacebarKeyCode = 32

    document.addEventListener('click', e => this.onAction())
    document.addEventListener('keydown', e => {
      if (e.keyCode === spacebarKeyCode) {
        this.onAction()
      }
    })
  }

  updateState(state) {
    for (let key in this.STATES) {
      this.mainContainer.classList.remove(this.STATES[key])
    }
    this.mainContainer.classList.add(state)
    this.state = state
  }

  onAction() {
    switch (this.state) {
      case this.STATES.READY:
        this.startGame()
        break
      case this.STATES.PLAYING:
        this.placeBlock()
        break
      case this.STATES.ENDED:
        this.restartGame()
        break
    }
  }

  startGame() {
    if (this.state != this.STATES.PLAYING) {
      this.scoreContainer.innerHTML = this.INITIAL_SCORE
      this.updateState(this.STATES.PLAYING)
      this.addBlock()
    }
  }

  restartGame() {
    this.updateState(this.STATES.RESETTING)

    let oldBlocks = this.placedBlocks.children
    let removeSpeed = 0.2
    let delayAmount = 0.02

    for (let i = 0; i < oldBlocks.length; i++) {
      TweenLite.to(
        oldBlocks[i].scale,
        removeSpeed,
        {
          x: 0,
          y: 0,
          z: 0,
          delay: (oldBlocks.length - i) * delayAmount,
          ease: Power1.easeIn,
          onComplete: () => this.placedBlocks.remove(oldBlocks[i])
        }
      )
      TweenLite.to(
        oldBlocks[i].rotation,
        removeSpeed,
        {
          y: 0.5,
          delay: (oldBlocks.length - i) * delayAmount,
          ease: Power1.easeIn
        }
      )
    }

    let cameraMoveSpeed = removeSpeed * 2 + (oldBlocks.length * delayAmount)
    this.stage.setCamera(2, cameraMoveSpeed)

    let countdown = {
      value: this.blocks.length - 1
    }
    TweenLite.to(
      countdown,
      cameraMoveSpeed,
      {
        value: 0,
        onUpdate: () => this.scoreContainer.innerHTML = String(this.math.round(countdown.value))
      }
    )

    this.blocks = this.blocks.slice(0, 1)

    setTimeout(() => {
      this.startGame()
    }, cameraMoveSpeed * 1000)
  }

  placeBlock() {
    let currentBlock = this.blocks[this.blocks.length - 1]
    let newBlocks = currentBlock.place()

    this.newBlocks.remove(currentBlock.mesh)

    if (newBlocks.placed) {
      this.placedBlocks.add(newBlocks.placed)
    }

    if (newBlocks.chopped) {
      this.choppedBlocks.add(newBlocks.chopped)

      let rotationRandomness = 10
      let positionParams = {
        y: '-=30',
        ease: Power1.easeIn,
        onComplete: () => this.choppedBlocks.remove(newBlocks.chopped)
      }
      let rotationParams = {
        delay: 0.05,
        x: newBlocks.plane == 'z'
          ? ((this.math.random() * rotationRandomness) - (rotationRandomness / 2))
          : 0.1,
        z: newBlocks.plane == 'x'
          ? ((this.math.random() * rotationRandomness) - (rotationRandomness / 2))
          : 0.1,
        y: this.math.random() * 0.1
      }

      if (newBlocks.chopped.position[newBlocks.plane] > newBlocks.placed.position[newBlocks.plane]) {
        positionParams[newBlocks.plane] = '+=' + (40 * this.math.abs(newBlocks.direction))
      } else {
        positionParams[newBlocks.plane] = '-=' + (40 * this.math.abs(newBlocks.direction))
      }

      TweenLite.to(newBlocks.chopped.position, 1, positionParams)
      TweenLite.to(newBlocks.chopped.rotation, 1, rotationParams)
    }
    this.addBlock()
  }

  addBlock() {
    let lastBlock = this.blocks[this.blocks.length - 1]

    if (lastBlock && lastBlock.state == lastBlock.STATES.MISSED) {
      return this.endGame()
    }

    this.scoreContainer.innerHTML = String(this.blocks.length - 1)

    let newBlock = new Block(lastBlock)
    this.newBlocks.add(newBlock.mesh)
    this.blocks.push(newBlock)

    this.stage.setCamera(this.blocks.length * 2)

    if(this.blocks.length >= 5) {
      this.instructions.classList.add('hide')
    }
  }

  endGame() {
    this.updateState(this.STATES.ENDED)
  }

  tick() {
    this.blocks[this.blocks.length - 1].tick()
    this.stage.render()
    requestAnimationFrame(() => this.tick())
  }
}
