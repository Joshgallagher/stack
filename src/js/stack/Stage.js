'use strict'

import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  Vector3,
  DirectionalLight,
  AmbientLight
} from 'three'
import { TweenLite } from "gsap"

export default class Stage {

  CANVAS_ID = 'canvas'
  CLIPPING = 1000

  windowWidth = window.innerWidth
  windowHeight = window.innerHeight
  aspectRatio = this.windowWidth / this.windowHeight

  container
  renderer
  scene
  camera
  light0
  light1

  constructor() {
    this.container = document.getElementById(this.CANVAS_ID)

    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: false
    })

    this.renderer.setSize(this.windowWidth, this.windowHeight)
    this.renderer.setClearColor('#D0CBC7', 1)
    this.container.appendChild(this.renderer.domElement)

    this.scene = new Scene()

    this.camera = new OrthographicCamera(
      this.aspectRatio,
      this.aspectRatio,
      20,
      -20,
      -100,
      this.CLIPPING
    )
    this.camera.position.x = 2
    this.camera.position.y = 2
    this.camera.position.z = 2
    this.camera.lookAt(new Vector3(0, 0, 0))

    this.light0 = new DirectionalLight(0xffffff, 0.5)
    this.light0.position.set(0, 499, 0)
    this.scene.add(this.light0)

    this.light1 = new AmbientLight(0xffffff, 0.4)
    this.scene.add(this.light1)

    this.registerListeners()
    this.onResize()
  }

  registerListeners() {
    window.addEventListener('resize', () => this.onResize())
  }

  onResize() {
    let viewportSize = 30
    this.renderer.setSize(this.windowWidth, this.windowHeight)
    this.camera.left = this.windowWidth / -viewportSize
    this.camera.right = this.windowWidth / viewportSize
    this.camera.top = this.windowHeight / viewportSize
    this.camera.bottom = this.windowHeight / -viewportSize
    this.camera.updateProjectionMatrix()
  }

  setCamera(y, speed = 0.3) {
    TweenLite.to(
      this.camera.position,
      speed,
      {
        y: y + 4,
        ease: Power1.easeInOut
      }
    )
    TweenLite.to(
      this.camera.lookAt,
      speed,
      {
        y,
        ease: Power1.easeInOut
      }
    )
  }

  render() {
    this.renderer.render(this.scene, this.camera)
  }

  add(element) {
    this.scene.add(element)
  }

  remove(element) {
    this.scene.remove(element)
  }
}
