
import Sprite from './sprite'
import CONFIG from '../config/config.js'

function Group(texture, frames, startingFrame) {
  var rand = Math.random

  this.texture = texture

  this.frames = frames

  this.startingFrame = startingFrame

  this._spriteArray = []

  this.count = 0

  this.create = function(total, origin, speed) {
    var sprite = {}
    var i = 0
    for (i = 0; i < total; i++) {
      sprite = new Sprite(origin[0], origin[1], this.texture, this.frames, this.startingFrame, 4)
      sprite.speedX = speed[0]
      sprite.speedY = speed[1]
      sprite.id = this.count
      this._spriteArray[this.count++] = sprite
    }
  }

  this._update = function(MIN_X, MAX_X, MIN_Y, MAX_Y) {
    var sprite = {}
    var i = 0
    for (i = 0; i < this.count; i++) {
      if (this._spriteArray[i]) {
        sprite = this._spriteArray[i]
        sprite.posX += sprite.speedX
        sprite.posY += sprite.speedY
        sprite.speedY += CONFIG.WORLD.GRAVITY

        // X axis bounds
        if (sprite.posX > MAX_X) {
          sprite.speedX *= -1
          sprite.posX = MAX_X
        } else if (sprite.posX < MIN_X) {
          sprite.speedX *= -1
          sprite.posX = MIN_X
        }

        // Y axis bounds
        if (sprite.posY > MAX_Y) {
          sprite.speedY *= -0.85
          sprite.posY = MAX_Y
          sprite.spin = (rand() - 0.5) * 0.2

          if (rand() > 0.5) {
            sprite.speedY -= rand() * 6
          }
        } else if (sprite.posY < MIN_Y) {
          sprite.speedY = 0
          sprite.posY = MIN_Y
        }

      }
    }
  }

  this._draw = function(tinyCanvas) {
    var i = 0
    for (i = 0; i < this.count; i++) {
      if (this._spriteArray[i]) {
        this._spriteArray[i]._draw(tinyCanvas)
      }
    }
  }
}

export default Group
