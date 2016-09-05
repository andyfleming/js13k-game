import Sprite from '../graphics/sprite'
import CONFIG from '../config/config'

export default function Bullet(texture, startingX, startingY, lastXDirection, index) {

  var self = this
  var firstFrames = 0

  // Store and expose the index so our collision engine can remove elements by index
  self.index = index

  // Initial state
  var direction = lastXDirection

  self.sprite = new Sprite(startingX, startingY, texture, [
    [0, 0, 4, 4],
    [4, 0, 4, 4]
  ], 0, 2)

  if (lastXDirection === 'l') {
    self.sprite.flipped = true
  }

  self.update = function(app, scene) {

    // Handle hiding muzzle flash
    if (firstFrames === 2) {
      self.sprite.setFrame(1)
    } else {
      firstFrames++
    }

    self.sprite.posX += (direction === 'l') ? -CONFIG.PROJECTILES.BULLET_SPEED : CONFIG.PROJECTILES.BULLET_SPEED

    if (self.sprite.posX <= 0 || self.sprite.posX >= (700 - 16)) {
      scene.removeProjectile(index)
      app.sound.fx.playBulletHit()
    }

  }

  self.draw = function(app) {
    self.sprite._draw(app.canvas)
  }

}
