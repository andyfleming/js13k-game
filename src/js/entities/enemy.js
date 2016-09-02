import Sprite from '../graphics/sprite'
import CONFIG from '../config/config'

export default function Enemy(texture, startingX) {

  var self = this

  // Initial state
  var direction = 'l'

  self.sprite = new Sprite(startingX, 263, texture, [
    [0, 0, 16, 20],
    [16, 0, 16, 20],
    [32, 0, 16, 20],
    [48, 0, 16, 20]
  ], 1, 4)

  self.update = function(app, scene) {
    self.sprite.posX += (direction === 'l') ? -CONFIG.ENEMY.MOVE_SPEED : CONFIG.ENEMY.MOVE_SPEED

    if (self.sprite.posX <= 0) {
      direction = 'r'
    } else if (self.sprite.posX >= (700 - 16)) {
      direction = 'l'
    }
  }

  self.draw = function(app) {
    self.sprite._draw(app.canvas)
  }

}
