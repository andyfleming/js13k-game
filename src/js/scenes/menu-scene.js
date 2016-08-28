export default function MenuScene(app) {

  const self = this

  var PlayerImage = new Image()
  var PlayerTexture = null
  var EnemyImage = new Image()
  var EnemyTexture = null

  // load
  self.load = function() {

    return Promise.all([
      new Promise(function(resolve) {
        PlayerImage.src    = 'person_cut_tiny.png'
        PlayerImage.onload = function() {
          PlayerTexture = TCTex(app.canvas.g, PlayerImage, PlayerImage.width, PlayerImage.height)
          resolve()
        }
      }),
      new Promise(function(resolve) {
        EnemyImage.src = 'enemy1.png'
        EnemyImage.onload = function() {
          EnemyTexture = TCTex(app.canvas.g, EnemyImage, EnemyImage.width, EnemyImage.height)
          resolve()
        }
      })
    ]).catch(function(err) { console.error(err) })
  }

  self.create = function() {
    console.log('creating scene')
  }

  // create
  // update
  self.update = function() {
    console.log('updating menu scene')
  }

  // draw
  self.draw = function() {
    console.log('drawing menu scene')
  }
}
