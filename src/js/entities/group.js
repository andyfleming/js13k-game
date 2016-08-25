/**
 * @class EntityGroup
 * @param {[type]} EntityClass  [description]
 * @param {[type]} texture      [description]
 * @param {[type]} frames       [description]
 * @param {[type]} initialFrame [description]
 * @param {[type]} options      [description]
 */
function EntityGroup(EntityClass, texture, frames, initialFrame, options) {
  this.texture = texture
  this.frames = frames
  this.initialFrame = initialFrame

  this.origin = options.origin || [0, 0]
  this.speed = options.speed || [1, 1]
  this.animSpeed = options.animSpeed || 4

  this.entityArray = []

  this.count = 0

  this.create = function(amount) {
    var i = 0
    for (i = 0; i < amount; i++) {
      this.entityArray[this.count++] = new EntityClass(
        this.origin,
        this.speed,
        this.texture,
        this.frames,
        this.initialFrame,
        this.animSpeed
      )
    }
  }

  this.update = function(timewarp, world) {
    var i = 0
    for (i = 0; i < this.count; i++) {
      if (this.entityArray[i].active) {
        this.entityArray[i].update(timewarp, world)
      } else {
        this.entityArray[i] = null
      }
    }
  }

  this.draw = function(tinyCanvas) {
    var i = 0
    for (i = 0; i < this.count; i++) {
      if (this.entityArray[i]) {
        this.entityArray[i].draw(tinyCanvas)
      }
    }
  }
}

export default EntityGroup
