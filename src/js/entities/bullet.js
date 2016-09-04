import Sprite from '../graphics/sprite'
import CONFIG from '../config/config'

export default function Bullet(texture, startingX, startingY, lastXDirection, index) {

  var self = this

  // Initial state
  var direction = lastXDirection

  self.sprite = new Sprite(startingX, startingY, texture, [
    [0, 0, 8, 8],
    [8, 0, 16, 8]
  ], 1, 2)

  if (lastXDirection === 'l') {
    self.sprite.flipped = true
  }

  self.update = function(app, scene) {
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
