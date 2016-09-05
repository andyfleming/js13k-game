import rand from '../math/rand'
import randInt from '../math/rand-int'

var NUM_DROPS = 200

function generateDrop(canvasWidth, canvasHeight, generateAtTop) {

  var xSpeed = -3 + rand() * 3 + 1.5
  var ySpeed = randInt(4, 9)
  var length = randInt(4, 16)

  return {
    x: rand() * canvasWidth,
    y: (generateAtTop) ? 0 : rand() * canvasHeight,
    xSpeed: xSpeed,
    ySpeed: ySpeed,
    length: length,
    rotation: Math.atan2(length, xSpeed) + 1.5708 // calculate the rotation and add 90 degrees
  }
}

export default function RainForeground(rainTexture, canvasWidth, canvasHeight) {

  console.log(canvasWidth, canvasHeight)

  var self = this
  var drops = []

  // Note:
  // 6.28319 radians in 360 degrees

  // Create drops
  for (var a = 0; a < NUM_DROPS; a++) {
    drops.push(generateDrop(canvasWidth, canvasHeight, false))
  }

  console.log(drops)

  /**
   * @todo handle timewarp
   */
  self.update = function(timewarp) {

    drops.forEach(function(drop, index) {
      drop.x += drop.xSpeed * (timewarp ? 0.1 : 1)
      drop.y += drop.ySpeed * (timewarp ? 0.1 : 1)

      // If drop is out of range, regenerate it
      if (drop.y > canvasHeight || drop.x < 0 || drop.x > canvasWidth) {
        drops[index] = generateDrop(canvasWidth, canvasHeight, true)
      }

    })

  }

  self.draw = function(tinyCanvas) {

    drops.forEach(function(drop) {

      tinyCanvas.push()
      tinyCanvas.trans(drop.x, drop.y)
      tinyCanvas.rot(drop.rotation)

      /**
       * tinyCanvas.img()
       *
       * @param {WebGLTexture} texture
       * @param {Number} x - 0 for top left; we'll use translate, "trans()", for positioning
       * @param {Number} y - 0 for top left; we'll use translate, "trans()", for positioning
       * @param {Number} width
       * @param {Number} height
       * @param {Number} u0
       * @param {Number} v0
       * @param {Number} u1
       * @param {Number} v1
       */
      tinyCanvas.img(rainTexture, 0, 0, 1, drop.length, 0, 0, 1, 1)

      tinyCanvas.pop()

    })


  }

}
