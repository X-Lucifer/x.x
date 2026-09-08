import { Quaternion, Vector2, Vector3 } from 'three'

/** Screen-space rotation: pointer distance maps directly to angle on either axis. */
export class InertialRotation {
  readonly orientation = new Quaternion()
  readonly velocity = new Vector2()
  private readonly axis = new Vector3()
  private readonly step = new Quaternion()
  private readonly origin = new Quaternion()
  private returning = false

  grab() {
    this.velocity.set(0, 0)
    this.returning = false
  }

  private rotate(x: number, y: number) {
    const angle = Math.hypot(x, y)
    if (angle < 1e-8) return
    this.axis.set(x / angle, y / angle, 0)
    this.step.setFromAxisAngle(this.axis, angle)
    this.orientation.premultiply(this.step).normalize()
  }

  drag(dx: number, dy: number, seconds: number, radiansPerPixel: number) {
    const x = dy * radiansPerPixel
    const y = dx * radiansPerPixel
    this.rotate(x, y)
    const delta = Math.max(0.004, Math.min(seconds, 0.08))
    const ease = 1 - Math.exp(-delta * 40)
    this.velocity.x += (x / delta - this.velocity.x) * ease
    this.velocity.y += (y / delta - this.velocity.y) * ease
    this.velocity.clampLength(0, 9)
  }

  release(secondsSinceMove: number, reducedMotion = false) {
    if (reducedMotion || secondsSinceMove > 0.09) this.velocity.set(0, 0)
  }

  nudge(x: number, y: number) {
    this.grab()
    this.rotate(x, y)
  }

  reset(immediate = false) {
    this.grab()
    this.returning = !immediate
    if (immediate) this.orientation.identity()
  }

  update(seconds: number, dragging: boolean, reducedMotion = false) {
    if (dragging) return
    if (this.returning) {
      this.orientation.slerp(this.origin, reducedMotion ? 1 : 1 - Math.exp(-seconds * 11))
      if (this.orientation.angleTo(this.origin) < 0.0001) {
        this.orientation.identity()
        this.returning = false
      }
      return
    }
    if (reducedMotion) { this.velocity.set(0, 0); return }
    // Integrate exponential friction analytically so 60/120/144 Hz travel equally far.
    const decay = Math.exp(-seconds * 4.6)
    const distance = (1 - decay) / 4.6
    this.rotate(this.velocity.x * distance, this.velocity.y * distance)
    this.velocity.multiplyScalar(decay)
    if (this.velocity.lengthSq() < 0.00001) this.velocity.set(0, 0)
  }

  get moving() {
    return this.returning || this.velocity.lengthSq() > 0
  }
}
