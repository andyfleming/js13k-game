import Sprite from '../graphics/sprite'
import CONFIG from '../config/config'

export default function Player(texture) {

  var self = this

  var speedX = 0
  var speedY = 0

  // origin, speed, frames, startingFrame, animSpeed

  self.sprite = new Sprite(100, 100, texture, [
    [0, 0, 16, 20],
    [16, 0, 16, 20],
    [32, 0, 16, 20],
    [48, 0, 16, 20],
    [64, 0, 16, 20]
  ], 1, 4)

  self.update = function(app, scene) {

    if (app.keys[CONFIG.KEY.MOVE_LEFT]) {
      self.sprite.direction = 'l'

      speedX = Math.max(speedX - CONFIG.MOVEMENT.WALK_SPEED, -CONFIG.MOVEMENT.WALK_SPEED_MAX)

    } else if (app.keys[CONFIG.KEY.MOVE_RIGHT]) {
      self.sprite.direction = 'r'
      speedX = Math.min(speedX + CONFIG.MOVEMENT.WALK_SPEED, CONFIG.MOVEMENT.WALK_SPEED_MAX)

    } else {

      // TODO: add if on ground, speed *= 0.8
      if (Math.abs(speedX) < 1) {
        speedX = 0
      } else {
        speedX *= 0.95
      }

    }

    self.sprite.posX += speedX
    self.sprite.posY += speedY

    speedY += CONFIG.WORLD.GRAVITY

    if (self.sprite.posY >= 263) {
      self.sprite.posY = 263
    }

    console.log(speedX)

  }

  self.draw = function(app) {

    self.sprite._draw(app.canvas)

  }

}
