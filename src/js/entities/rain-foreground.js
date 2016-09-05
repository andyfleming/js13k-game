export default function RainForeground(rainTexture) {

  var self = this
  var drops = []

  // Create drops
  drops.push({
    x: 100,
    y: 100,
    rotation: 0,
    length: 10
  })

  self.update = function() {

    drops.forEach(function(drop) {
      
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
