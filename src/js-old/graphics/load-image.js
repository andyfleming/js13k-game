/**
 * Returns a promise for loading an image and resolving a texture
 *
 * @param app
 * @param {string} src
 * @param {Image} image
 *
 * @returns {Promise}
 */
export default function loadImage(app, src, image) {
  return new Promise(function(resolve) {
    image.src    = 'images/' + src
    image.onload = function() {
      resolve(TCTex(app.canvas.g, image, image.width, image.height))
    }
  })
}
