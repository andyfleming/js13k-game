import Sprite from '../graphics/sprite'
import CONFIG from '../config/config'

export default function Enemy(texture, startingX, index) {

  var self = this

  // Initial state
  var direction = 'l'

  // Store and expose the index so our collision engine can remove elements by index
  self.index = index

  self.sprite = new Sprite(startingX, 263, texture, [
    [0, 0, 16, 20],
    [16, 0, 16, 20],
    [32, 0, 16, 20],
    [48, 0, 16, 20]
  ], 1, 4)

  self.update = function(app, scene) {

    // Animate, but only every 3rd frame if we are in timewarp
    if (!scene.timewarp || app.frameCount % 3 === 0) {
      self.sprite.animate(app.frameCount)
    }

    var directionalModifier = (direction === 'l') ? -1 : 1
    var timewarpModifier = (scene.timewarp) ? 0.3 : 1

    self.sprite.posX += CONFIG.ENEMY.MOVE_SPEED * directionalModifier * timewarpModifier

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
