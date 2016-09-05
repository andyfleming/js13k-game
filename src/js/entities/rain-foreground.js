var NUM_DROPS = 10
var rand = Math.random

export default function RainForeground(rainTexture, canvasWidth, canvasHeight) {

  console.log(canvasWidth, canvasHeight)

  var self = this
  var drops = []

  // Note:
  // 6.28319 radians in 360 degrees

  // Create drops
  for (var a = 0; a < NUM_DROPS; a++) {
    drops.push({
      x: rand() * canvasWidth,
      y: rand() * canvasHeight,
      rotation: 0.1,
      length: 10
    })
  }

  console.log(drops)

  /**
   * @todo handle timewarp
   */
  self.update = function() {

    drops.forEach(function(drop) {
      drop.y += 1
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
      tinyCanvas.img(rainTexture, 0, 0, 1, drop.length, 0, 0, 1, drop.length)

      tinyCanvas.pop()

    })


  }

}
