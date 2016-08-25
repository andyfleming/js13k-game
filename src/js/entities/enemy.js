
import Sprite from '../graphics/sprite'
import U from '../utils'

var ENEMY_COUNT = 0

/**
 * @class EnemyEntity
 * @type Entity
 * @param {[type]} origin        [description]
 * @param {[type]} speed         [description]
 * @param {[type]} texture       [description]
 * @param {[type]} frames        [description]
 * @param {[type]} startingFrame [description]
 * @param {[type]} animSpeed     [description]
 */
function Enemy(origin, speed, texture, frames, startingFrame, animSpeed) {
  this.texture = texture
  this.frames = frames
  this.startingFrame = startingFrame
  this.animSpeed = animSpeed
  this.id = ENEMY_COUNT++
  this.active = true

  this.sprite = new Sprite(origin[0], origin[1], texture, this.frames, this.startingFrame, this.animSpeed)
  this.sprite.speedX = speed[0]
  this.sprite.speedY = speed[1]

  this.update = function(timewarp, world) {
    timewarp = timewarp || 1

    this.sprite.posX += this.sprite.speedX * timewarp
    this.sprite.posY += this.sprite.speedY * timewarp
    this.sprite.speedY += world.GRAVITY * timewarp

    // clamp X bounds
    if (this.sprite.posX > world.MAX_X) {
      this.sprite.speedX *= -1
      this.sprite.posX = world.MAX_X
    } else if (this.sprite.posX < world.MIN_X) {
      this.sprite.speedX *= -1
      this.sprite.posX = world.MIN_X
    }

    // Y axis bounds
    if (this.sprite.posY > world.MAX_Y) {
      this.sprite.speedY *= -0.85
      this.sprite.posY = world.MAX_Y
      this.sprite.spin = (U.rand() - 0.5) * 0.2

      if (U.rand() > 0.5) {
        this.sprite.speedY -= U.rand() * 6
      }
    } else if (this.sprite.posY < world.MIN_Y) {
      this.sprite.speedY = 0
      this.sprite.posY = world.MIN_Y
    }

  }

  this.draw = function(tinyCanvas) {
    this.sprite._draw(tinyCanvas)
  }
}

export default Enemy
